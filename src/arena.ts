import { Tile, Action, Direction, IDecision, IUnit, Agent, fromMapToTensor, toSightLine } from './agent';
import { tile } from '@tensorflow/tfjs';

export const Sight_Distance = 5;

export const createEmptyMap = (tiles: number): Tile[][] => {
    let map: any[][] = [];
    for (let x = 0; x < tiles; x++) {
        map[x] = [];
        for (let y = 0; y < tiles; y++) {
            map[x][y] = Tile.Empty;
        }
    }

    return map;
}

export class Battle {
    public agents: Agent[];
    public map: Tile[][];

    constructor(agents: Agent[], tiles: number) {
        this.agents = agents;
        this.map = createEmptyMap(tiles);

        // add some random walls
        for(var i = 0; i < tiles * tiles / 10; i++){
            let x = Math.floor(Math.random() * tiles);
            let y= Math.floor(Math.random() * tiles);
            this.map[x][y] = Tile.Wall;
        }

        // put the agents on the board
        agents.forEach(agent => {
            agent.x = Math.floor(Math.random() * tiles);
            agent.y = Math.floor(Math.random() * tiles);
            this.map[agent.x][agent.y] = agent.team == 1 ? Tile.Team1 : Tile.Team2;
        });

        // build some "terrain"
    }

    public runOneStep() {
        // run one step of the battle

        // everyone decides on a move
        const decisions = this.agents.map(agent => agent.decideMove(toSightLine(this.map, agent.x, agent.y, Sight_Distance)))

        // take all actions
        decisions.forEach((d, i) => {
            console.log(d);
            const agent = this.agents[i];
            let dX = 0;
            let dY = 0;
            switch (d.direction) {
                case Direction.Up:
                    dY--;
                    break;
                case Direction.Down:
                    dY++;
                    break;
                case Direction.Left:
                    dX--;
                    break;
                case Direction.Right:
                    dX++;
                    break;
            }

            let targetX = agent.x+dX;
            let targetY = agent.y+dY;

            if(targetX < 0 || targetX > this.map.length
                ||targetY < 0 || targetY > this.map[targetX].length){
                // bad action, skip the rest
                agent.failedActions++;
                return;
            }

            if (d.action == Action.Move) {
                if(this.map[targetX][targetY] == Tile.Empty){
                    this.map[agent.x][agent.y] = Tile.Empty;
                    agent.x += dX;
                    agent.y += dY;
                    this.map[agent.x][agent.y] = agent.team == 1 ? Tile.Team1 : Tile.Team2;
                    agent.distanceMoved++;
                }
                else {
                    agent.failedActions++;
                }
            }
            else if(d.action == Action.Melee){
                if(this.map[agent.x+dX][agent.y+dY] == (agent.team == 1 ? Tile.Team2 : Tile.Team1)){
                    agent.damageDealt++;
                    // todo... do the damage to the other agent...
                }
                else if(this.map[agent.x+dX][agent.y+dY] == (agent.team != 1 ? Tile.Team2 : Tile.Team1)){
                    // friendly damage!
                    agent.failedActions++;
                }
                else {
                    // a missed attack isn't that bad?
                    agent.failedActions += .1;
                }
            }
        });

    }

    public runBattle() {
        // run steps until someone is dead or some time limit is reached
        for(var i = 0; i < 20; i++){
            this.runOneStep();
        }

        // get the winners
    }
}

export class Arena {
    public agents: Agent[] = [];
    constructor() {
        // add some agents here!
    }
}