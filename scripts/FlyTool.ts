class FlyTool {

    public static CreateFlightPlan(from: BABYLON.Vector3, fromPlanet: Planet, to: BABYLON.Vector3, toPlanet: Planet): BABYLON.Vector3[] {

        let dir = to.subtract(from).normalize();
        console.log("from " + from.toString());
        console.log("to " + to.toString());

        // insert takeOff
        let takeOffUp = from.subtract(fromPlanet.position).normalize();
        let takeOffPoint = from.add(dir.scale(30)).add(takeOffUp.scale(30));

        // insert landing
        let landingUp = to.subtract(toPlanet.position).normalize();
        let landingPoint = to.subtract(dir.scale(30)).add(landingUp.scale(30));

        let flightPlan = [from.clone(), takeOffPoint, landingPoint, to.clone()];
        
        flightPlan = FlyTool.SmoothFlightPlan(flightPlan);
        flightPlan = FlyTool.SmoothFlightPlan(flightPlan);

        return flightPlan;
    }

    public static SmoothFlightPlan(flightPlan: BABYLON.Vector3[]): BABYLON.Vector3[] {
        let extendedFlightPlan: BABYLON.Vector3[] = [];

        for (let i = 0; i < flightPlan.length - 1; i++) {
            extendedFlightPlan.push(flightPlan[i].clone());
            extendedFlightPlan.push(flightPlan[i].add(flightPlan[i + 1]).scale(0.5));
        }

        extendedFlightPlan.push(flightPlan[flightPlan.length - 1]);

        let smoothedFlightPlan: BABYLON.Vector3[] = [extendedFlightPlan[0].clone()];
        for (let i = 1; i < extendedFlightPlan.length - 1; i++) {
            smoothedFlightPlan[i] = extendedFlightPlan[i].add(extendedFlightPlan[i - 1]).add(extendedFlightPlan[i + 1]).scale(1 / 3);
        }
        smoothedFlightPlan.push(extendedFlightPlan[extendedFlightPlan.length - 1].clone());

        return smoothedFlightPlan;
    }

    public static ShowFlightPlan(flightPlan: BABYLON.Vector3[], scene: BABYLON.Scene): void {
        BABYLON.MeshBuilder.CreateLines("flightPlan", { points: flightPlan }, scene);
    }
}