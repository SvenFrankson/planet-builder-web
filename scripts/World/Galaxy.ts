class Galaxy {

    public name: string = "galaxy";
    
	public planets: Planet[] = [];

    constructor(public universe: Universe) {
        this.universe.galaxies.push(this);
    }
}