import * as tf from '@tensorflow/tfjs';
import { Sequential } from '@tensorflow/tfjs';
import { Sight_Distance } from './arena';

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
            if (curX == x && curY == y) {
                tile = Tile.Empty;
            }
            else if (curX > 0 && curX < (map.length - 1)
                && curY > 0 && curY < (map[curX].length - 1)) {
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

export const createModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.conv2d({
      inputShape: [Sight_Distance * 2, Sight_Distance * 2, 5],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: "VarianceScaling",
    }));
    model.add(tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2],
    }));
    // flatten then use dense to classify
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
      units: 7,
      kernelInitializer: 'VarianceScaling',
      activation: 'softmax'
    }));
  
    return model;
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

    mutate() {
        const scale = .01;
        const originalWeights = this.model.getWeights(false);
        var newModel = createModel();
        newModel.setWeights(originalWeights.map(o => o.add(tf.randomNormal(o.shape).mul(scale))));
        return new Agent(newModel);
    }

    decideMove(sightLine: Tile[][]): IDecision {
        const result = this.model.predict(toTensor(sightLine));
        const resultVar = tf.variable(result as any);
        //resultVar.print();

        var resultArray = resultVar.arraySync() as number[];
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

        return decision;
    }
}