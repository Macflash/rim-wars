import React, { Component } from 'react';
import './App.css';

import * as tf from '@tensorflow/tfjs';
import { Tile, Action, Direction, IDecision, IUnit, Agent, createModel } from './agent';
import { Battle, Sight_Distance } from './arena';

interface IAppState {
  terrainCanvas?: HTMLCanvasElement;
  playerCanvas?: HTMLCanvasElement;
}

class App extends Component<{}, IAppState> {
  private battle: Battle;
  private size = 600;
  private tiles = 20;
  private terrainCtx?: CanvasRenderingContext2D;
  private playerCtx?: CanvasRenderingContext2D;

  constructor(props: any) {
    super(props);
    this.state = {};

    var a = new Agent(createModel());
    var b = new Agent(createModel());

    a.team = 1;
    b.team = 2;

    this.battle = new Battle([a, b], 20);
  }

  componentDidUpdate() {
    if (this.playerCtx && this.terrainCtx) {
      this.drawTerrain(this.battle.map, this.terrainCtx);
    }
  }

  private createEmptyMap(tiles: number): Tile[][] {
    let map: any[][] = [];
    for (let x = 0; x < tiles; x++) {
      map[x] = [];
      for (let y = 0; y < tiles; y++) {
        map[x][y] = Tile.Empty;
      }
    }

    return map;
  }

  private drawTerrain(map: Tile[][], ctx: CanvasRenderingContext2D) {
    const tileSize = Math.max(Math.floor(this.size / this.tiles), 1);
    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        switch (map[x][y]) {
          case Tile.Empty:
            ctx.fillStyle = "white";
            break;
          case Tile.Wall:
            ctx.fillStyle = "black";
            break;
          case Tile.Team1:
            ctx.fillStyle = "red";
            break;
          case Tile.Team2:
            ctx.fillStyle = "blue";
            break;

        }

        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  private runBattles(x: number){
    for(var i = 0; i < x; i++){
      this.runBattle();
    }
  }

  private runBattle(){
    var winner = new Agent(this.battle.runBattle().model);
    var new1 = winner.mutate();
    var new2 = winner.mutate();
    var new3 = winner.mutate();

    winner.team = 1;
    new1.team = 1;
    new2.team = 0;
    new3.team = 0;

    this.battle = new Battle([winner, new1, new2, new3], 20);
  }

  private tensorTest(ctx: CanvasRenderingContext2D) {
    this.battle.runOneStep();
    this.drawTerrain(this.battle.map, ctx);
  }


  private setPlayerCanvas = (playerCanvas: HTMLCanvasElement | null) => {
    if (playerCanvas && !this.state.playerCanvas) {
      this.setState({ playerCanvas });
      this.playerCtx = playerCanvas.getContext("2d")!;
    }
  }

  private setTerrainCanvas = (terrainCanvas: HTMLCanvasElement | null) => {
    if (terrainCanvas && !this.state.terrainCanvas) {
      this.setState({ terrainCanvas });
      this.terrainCtx = terrainCanvas.getContext("2d")!;
    }
  }

  render() {
    return (
      <div>
        <canvas
          style={{ position: "absolute", top: 40, left: 0, zIndex: 1 }}
          height={this.size}
          width={this.size}
          id="terrainCanvas"
          ref={this.setTerrainCanvas}
        />
        <canvas
          style={{ position: "absolute", top: 40, left: 0, zIndex: 2 }}
          height={this.size}
          width={this.size}
          id="playerCanvas"
          ref={this.setPlayerCanvas}
        />
        <div>
          <button onClick={() => {
            this.battle.runOneStep();
            this.drawTerrain(this.battle.map, this.terrainCtx!)
          }}>Run step</button>
          
          <button onClick={this.runBattle}>Run Battle</button>

          <button onClick={()=>{this.runBattles(500);}}>Run 500 Battles</button>
        </div>
      </div>
    );
  }
}

export default App;
