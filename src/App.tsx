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
  private tiles = 10;
  private terrainCtx?: CanvasRenderingContext2D;
  private playerCtx?: CanvasRenderingContext2D;

  constructor(props: any) {
    super(props);
    this.state = {};

    var a = new Agent(createModel());
    var b = new Agent(createModel());

    a.team = 1;
    b.team = 2;

    this.battle = new Battle([a, b], this.tiles);
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
      if(this.runBattle(i == x - 1)){
        console.log("woah!");
        break;
      }
    }
  }

  private rematch = () => {
    this.battle = new Battle(this.battle.agents, this.tiles);
  }

  private newMatch = () => {
    var best = this.battle.runBattle();

    var winner = new Agent(best.model);
    var new1 = winner.mutate();
    var new2 = winner.mutate();
    var new3 = winner.mutate();

    winner.team = 1;
    new1.team = 1;
    new2.team = 0;
    new3.team = 0;

    this.battle = new Battle([winner, new1, new2, new3], this.tiles);
    this.drawTerrain(this.battle.map, this.terrainCtx!);
  }

  private runBattle = (draw?: boolean) => {
    var best = this.battle.runBattle();

    if(best.bestScore > 10){
      console.log("hey!");
      return true;
    }

    var winner = new Agent(best.model);
    var new1 = winner.mutate();
    var new2 = winner.mutate();
    var new3 = winner.mutate();

    winner.team = 1;
    new1.team = 1;
    new2.team = 0;
    new3.team = 0;

    if(draw){
      this.drawTerrain(this.battle.map, this.terrainCtx!);
    }

    this.battle = new Battle([winner, new1, new2, new3], this.tiles);
    return false;
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
          
          <button onClick={()=>{this.rematch()}}>Rematch</button>
          <button onClick={()=>{this.newMatch()}}>new match</button>
          <button onClick={()=>{this.runBattle(true)}}>Run Battle</button>

          <button onClick={()=>{this.runBattles(10);}}>Run 10 Battles</button>
          <button onClick={()=>{this.runBattles(100);}}>Run 100 Battles</button>
          <button onClick={()=>{this.runBattles(500);}}>Run 500 Battles</button>
        </div>
      </div>
    );
  }
}

export default App;
