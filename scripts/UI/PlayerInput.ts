class PlayerInput {

    public game: Game;

    constructor(
        public player: Player
    ) {
        this.game = player.game;
    }

    public connectInput(): void {

    }
}