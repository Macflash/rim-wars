import React, { Component } from 'react';
import './App.css';

import * as tf from '@tensorflow/tfjs';

enum Tile {
  Empty,
  Wall,
  Team1,
  Team2
}

enum Actions {
  Left,
  Right,
  Up,
  Down,

  Wait,
  Move,
  Attack,
}

interface IAppState {
  terrainCanvas?: HTMLCanvasElement;
  playerCanvas?: HTMLCanvasElement;
}

class App extends Component<{}, IAppState> {
  private size = 600;
  private tiles = 20;
  private terrainCtx?: CanvasRenderingContext2D;
  private playerCtx?: CanvasRenderingContext2D;

  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (this.playerCtx && this.terrainCtx) {
      const map = this.createEmptyMap(this.tiles);
      map[1][1] = Tile.Wall;
      map[3][5] = Tile.Team1;
      map[18][13] = Tile.Team2;
      this.drawTerrain(map, this.terrainCtx);
      this.tensorTest(map);
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

  private tensorTest(map: Tile[][]) {
    var sightRange = 5;
    const t = tf.tidy(() => {
      return tf.tensor3d(map.map(row => row.map(this.toVector)));
    });

    const model = tf.sequential();

    model.add(tf.layers.conv2d({
      inputShape: [20, 20, 5],
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

    // lets do that again
    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    }));
    
    model.add(tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2]
    }));

    // flatten then use dense to classify
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
      units: 7,
      kernelInitializer: 'VarianceScaling',
      activation: 'softmax'
    }));

    // very simply add some value to the weights
    // this could be useful to add some noise during each GENERATION
    let lastLayer = model.layers[model.layers.length-1];
    lastLayer.weights[0].read().print();

    const weights = model.weights;
    model.setWeights(weights.map(w => w.read().add(.1)));

    lastLayer = model.layers[model.layers.length-1];
    lastLayer.weights[0].read().print();

    const result = model.predict(t.expandDims(0));
    console.log("result", result);
    tf.print(result as any);
  }

  private toVector(tile: Tile): number[] {
    const length = 5;
    const arr = new Array<number>(5);
    arr[tile] = 1;
    return arr;
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
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
          height={this.size}
          width={this.size}
          id="terrainCanvas"
          ref={this.setTerrainCanvas}
        />
        <canvas
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
          height={this.size}
          width={this.size}
          id="playerCanvas"
          ref={this.setPlayerCanvas}
        />
      </div>
    );
  }
}

export default App;
