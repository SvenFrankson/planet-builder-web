class PlanetChunckNice extends PlanetChunck {

    public findAdjacents(): void {
        this._adjacents = [];
        this.adjacentsAsArray = [];
        for (let di = - 1; di <= 1; di++) {
            for (let dj = - 1; dj <= 1; dj++) {
                for (let dk = - 1; dk <= 1; dk++) {
                    if (di != 0 || dj != 0 || dk != 0) {
                        if (!this._adjacents[1 + di]) {
                            this._adjacents[1 + di] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj]) {
                            this._adjacents[1 + di][1 + dj] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj][1 + dk]) {
                            let n = this.planetSide.getChunck(this.iPos + di, this.jPos + dj, this.kPos + dk, this.degree);
                            if (n instanceof PlanetChunck) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = [n];
                                this.adjacentsAsArray.push(n);
                            }
                        }
                    }
                }
            }
        }
    }

    public syncWithAdjacents(): boolean {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            console.log("cancel sync");
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        let right = this._adjacents[2][1][1][0];
        for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[PlanetTools.CHUNCKSIZE][j][k] = right.GetDataNice(0, j, k);
            }
        }
        let front = this._adjacents[1][2][1][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[i][PlanetTools.CHUNCKSIZE][k] = front.GetDataNice(i, 0, k);
            }
        }
        let above = this._adjacents[1][1][2][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                this.data[i][j][PlanetTools.CHUNCKSIZE] = above.GetDataNice(i, j, 0);
            }
        }

        for (let n = 0; n < PlanetTools.CHUNCKSIZE; n++) {
            this.data[n][PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE] = this._adjacents[1][2][2][0].GetDataNice(n, 0, 0);
            this.data[PlanetTools.CHUNCKSIZE][n][PlanetTools.CHUNCKSIZE] = this._adjacents[2][1][2][0].GetDataNice(0, n, 0);
            this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][n] = this._adjacents[2][2][1][0].GetDataNice(0, 0, n);
        }
        this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE] = this._adjacents[2][2][2][0].GetDataNice(0, 0, 0);
        
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
}

class PlanetChunckSemiNice extends PlanetChunck {

    public syncWithAdjacents(): boolean {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            console.log("cancel sync");
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();

        let right = this._adjacents[2][1][1][0];
        for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[PlanetTools.CHUNCKSIZE][j][k] = right.GetDataNice(0, j, k);
            }
        }
        let front = this._adjacents[1][2][1][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[i][PlanetTools.CHUNCKSIZE][k] = front.GetDataNice(i, 0, k);
            }
        }

        for (let n = 0; n < PlanetTools.CHUNCKSIZE; n++) {
            this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][n] = this._adjacents[2][2][1][0].GetDataNice(0, 0, n);
        }
        
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
}