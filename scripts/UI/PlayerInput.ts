class PlayerInput {

    public game: Main;

    constructor(
        public player: Player
    ) {
        this.game = player.main;
    }

    public connectInput(): void {

    }
}