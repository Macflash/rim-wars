import { Tile, Action, Direction, IDecision, IUnit, Agent, fromMapToTensor, toSightLine } from './agent';

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

    constructor(agents: Agent[], tiles: number){
        this.agents = agents;
        this.map = createEmptyMap(tiles);
        // place agents on the map
        // build some "terrain"
    }

    public runOneStep(){
        // run one step of the battle

        // everyone decides on a move
        var decisions = this.agents.map(agent => agent.decideMove(toSightLine(this.map, agent.x, agent.y, Sight_Distance)))
        
        // take all actions
        
    }

    public runBattle(){
        // run steps until someone is dead or some time limit is reached
    }
}

export class Arena {
    public agents: Agent[] = [];
    constructor(){
        // add some agents here!
    }
}