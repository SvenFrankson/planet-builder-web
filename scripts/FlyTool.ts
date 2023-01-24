class FlightPlan {
    
    constructor(
        public from: BABYLON.Vector3,
        public fromPlanet: Planet,
        public to: BABYLON.Vector3,
        public toPlanet: Planet,
        public waypoints: BABYLON.Vector3[]
    ) {

    }
}

class FlyTool {

    public static CreateFlightPlan(from: BABYLON.Vector3, fromPlanet: Planet, to: BABYLON.Vector3, toPlanet: Planet): FlightPlan {
        let dir = to.subtract(from).normalize();
        let h = 20;

        // insert takeOff
        let takeOffAltitude = BABYLON.Vector3.Distance(from, fromPlanet.position);
        let takeOffY = from.subtract(fromPlanet.position).normalize();
        let takeOffX = BABYLON.Vector3.Cross(takeOffY, dir).normalize();
        let takeOffZ = BABYLON.Vector3.Cross(takeOffX, takeOffY).normalize();
        let takeOffPoint = from.add(takeOffZ.scale(2 * h)).add(takeOffY.scale(h));

        // insert landing
        let landingAltitude = BABYLON.Vector3.Distance(to, toPlanet.position);
        let landingY = to.subtract(toPlanet.position).normalize();
        let landingX = BABYLON.Vector3.Cross(landingY, dir).normalize();
        let landingZ = BABYLON.Vector3.Cross(landingX, landingY).normalize();
        let landingPoint = to.add(landingZ.scale(- 2 * h)).add(landingY.scale(h));

        takeOffAltitude = BABYLON.Vector3.Distance(fromPlanet.position, takeOffPoint);
        landingAltitude = BABYLON.Vector3.Distance(toPlanet.position, landingPoint);

        let waypoints = [takeOffPoint, landingPoint];
        
        for (let n = 0; n < 5; n++) {
            waypoints = FlyTool.SmoothFlightPlan(waypoints);
            for (let i = 1; i < waypoints.length - 1; i++) {
                if (BABYLON.Vector3.DistanceSquared(waypoints[i], fromPlanet.position) < takeOffAltitude * takeOffAltitude) {
                    VMath.ForceDistanceInPlace(waypoints[i], fromPlanet.position, takeOffAltitude);
                }
                if (BABYLON.Vector3.DistanceSquared(waypoints[i], toPlanet.position) < landingAltitude * landingAltitude) {
                    VMath.ForceDistanceInPlace(waypoints[i], toPlanet.position, landingAltitude);
                }
            }
        }
        waypoints = [from, ...waypoints, to];
        waypoints = FlyTool.SmoothFlightPlan(waypoints);
        waypoints = FlyTool.SmoothFlightPlan(waypoints);
        waypoints = FlyTool.SmoothFlightPlan(waypoints);

        return new FlightPlan(
            from.clone(),
            fromPlanet,
            to.clone(),
            toPlanet,
            waypoints
        );
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

    public static ShowWaypoints(flightPlan: BABYLON.Vector3[], scene: BABYLON.Scene): void {
        BABYLON.MeshBuilder.CreateLines("flightPlan", { points: flightPlan }, scene);
    }

    public static Fly(flightPlan: FlightPlan, player: Player, scene: BABYLON.Scene): void {
        let index = 1;
        let takeOffUp = flightPlan.from.subtract(flightPlan.fromPlanet.position).normalize();
        let landingUp = flightPlan.to.subtract(flightPlan.toPlanet.position).normalize();
        let totalDist = BABYLON.Vector3.Distance(flightPlan.from, flightPlan.to);
        let totalDir = flightPlan.to.subtract(flightPlan.from).normalize();

        let step = () => {
            let wp = flightPlan.waypoints[index];
            if (wp) {
                let dir = wp.subtract(flightPlan.waypoints[index - 1]).normalize();
                let dist = BABYLON.Vector3.Dot(player.position.subtract(flightPlan.from), totalDir);
                let f = dist / totalDist;
                if ((1 - f) * totalDist > 20) {
                    player.targetLook = flightPlan.to;
                    player.targetLookStrength = 0.1;
                }
                else {
                    player.targetLook = undefined;
                    player.targetLookStrength = 1;
                }
                let speed = Math.sin(f * Math.PI) * 70 + 5;

                let up = takeOffUp.scale(1 - f).add(landingUp.scale(f)).normalize();

                if (BABYLON.Vector3.DistanceSquared(wp, player.position) < 1 || BABYLON.Vector3.Dot(wp.subtract(player.position), dir) <= 0) {
                    index++;
                    step();
                }
                else {
                    VMath.StepToRef(player.position, wp, speed / 60, player.position);
                    player.upDirection.copyFrom(up);
                    requestAnimationFrame(step);
                }
            }
            else {
                player.lockInPlace = false;
            }
        }
        player.lockInPlace = true;
        step();
    }
}