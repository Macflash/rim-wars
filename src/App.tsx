import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

enum Tile {
  Empty,
  Wall,
  Team1,
  Team2
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

  componentDidUpdate(){
    if(this.playerCtx && this.terrainCtx){
      const map = this.createEmptyMap(this.tiles);
      map[1][1] = Tile.Wall;
      map[3][5] = Tile.Team1;
      map[18][13] = Tile.Team2;
      this.drawTerrain(map, this.terrainCtx);
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
