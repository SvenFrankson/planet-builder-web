class PlayerInput {

    public game: Game | Demo;

    constructor(
        public player: Player
    ) {
        this.game = player.game;
    }

    public connectInput(): void {

    }
}