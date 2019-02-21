import * as tf from '@tensorflow/tfjs';
import { Sequential } from '@tensorflow/tfjs';

export enum Tile {
    Empty,
    Wall,
    Team1,
    Team2
}

export enum Direction {
    Left = 0,
    Right,
    Up,
    Down,
}

export enum Action {
    Wait = 4,
    Move,
    Melee,
}

export interface IDecision {
    action: Action;
    direction: Direction;
}

export interface IUnit {
    x: number;
    y: number;
    health: number;
    decideMove(map: Tile[][]): IDecision;
}

export const fromMapToTensor = (map: Tile[][], x: number, y: number, sightDistance: number) => {
    return toTensor(toSightLine(map, x, y, sightDistance));
}

export var toSightLine = (map: Tile[][], x: number, y: number, sightDistance: number): Tile[][] => {
    var subset: Tile[][] = [];
    for (var i = 0; i < sightDistance * 2; i++) {
        subset[i] = [];
        for (var j = 0; j < sightDistance * 2; j++) {
            var curX = x + i - sightDistance;
            var curY = y + j - sightDistance;

            var tile: Tile = Tile.Wall;
            if(curX == x && curY == y){
                tile = Tile.Empty;
            }
            else if(curX > 0 && curX < (map.length - 1)
            && curY > 0 && curY < (map[curX].length - 1)){
                tile = map[curX][curY];
            }

            subset[i][j] = tile;
        }
    }

    return subset;
}

var toVector = (tile: Tile): number[] => {
    const length = 5;
    const arr = new Array<number>(length);
    arr[tile] = 1;
    return arr;
}

var toTensor = (map: Tile[][]) => {
    // expand the dimensions to make it a "batch" (even though there is a single entry)
    return tf.tensor3d(map.map(row => row.map(toVector))).expandDims(0);
}

export class Agent implements IUnit {
    public team = 1;
    public damageDealt = 0;
    public distanceMoved = 0;
    public failedActions = 0;
    public x = 0;
    public y = 0;
    public health = 3;
    public model: Sequential;

    constructor(model: Sequential) {
        this.model = model;
        //var t = tf.tensor1d([1, 2, 3]);
    }

    decideMove(sightLine: Tile[][]): IDecision {
        const result = this.model.predict(toTensor(sightLine));
        const resultVar = tf.variable(result as any);
        resultVar.print();

        var resultArray = resultVar.arraySync() as number[];
        console.log(resultArray);

        var decision = {} as IDecision;

        // decide direction
        decision.direction = Direction.Left;
        if (resultArray[Direction.Right] > resultArray[decision.direction]) {
            decision.direction = Direction.Right;
        }
        if (resultArray[Direction.Up] > resultArray[decision.direction]) {
            decision.direction = Direction.Up;
        }
        if (resultArray[Direction.Down] > resultArray[decision.direction]) {
            decision.direction = Direction.Down;
        }

        // decide action
        decision.action = Action.Move;
        if (resultArray[Action.Wait] > resultArray[decision.action]) {
            decision.action = Action.Wait;
        }
        if (resultArray[Action.Melee] > resultArray[decision.action]) {
            decision.action = Action.Melee;
        }

        console.log("decision", decision)

        return decision;
    }
}