import React, { Component } from 'react';
import './App.css';

import * as tf from '@tensorflow/tfjs';
import { Tile, Action, Direction, IDecision, IUnit, Agent } from './agent';
import { Battle } from './arena';

interface IAppState {
  terrainCanvas?: HTMLCanvasElement;
  playerCanvas?: HTMLCanvasElement;
}

var createModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.conv2d({
    inputShape: [10, 10, 5],
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
      const map = this.createEmptyMap(this.tiles);
      map[1][1] = Tile.Wall;
      map[3][5] = Tile.Team1;
      map[18][13] = Tile.Team2;
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

  private tensorTest(ctx: CanvasRenderingContext2D) {
    this.battle.runOneStep();
    this.drawTerrain(this.battle.map, ctx);


    /*
    // very simply add some value to the weights
    // this could be useful to add some noise during each GENERATION
    let lastLayer = model.layers[model.layers.length-1];
    lastLayer.weights[0].read().print();

    const weights = model.weights;
    model.setWeights(weights.map(w => w.read().add(.1)));

    lastLayer = model.layers[model.layers.length-1];
    var weightTensor = lastLayer.weights[0].read();
    var array = weightTensor.array().then(arr => console.log("array", arr));

    const result = model.predict(t.expandDims(0));
    console.log("result", result);
    tf.print(result as any);
    */
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
        <div><button onClick={() => {
          this.battle.runOneStep();
           this.drawTerrain(this.battle.map, this.terrainCtx!)}}>Run step</button></div>
      </div>
    );
  }
}

export default App;
