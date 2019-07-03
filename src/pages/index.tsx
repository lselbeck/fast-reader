import Button from '@material-ui/core/Button';
import React from 'react';

export default class Home extends React.Component<
  {},
  {
    text: string;
    textArray: string[];
    textIndex: number;
    speed: number;
    play: boolean;
    wpm: number | undefined;
  }
> {
  private interval: NodeJS.Timer | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      play: false,
      speed: this.convertWpmToMs(100),
      text: '',
      textArray: [],
      textIndex: 0,
      wpm: 100,
    };

    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.handleWpmChange = this.handleWpmChange.bind(this);
    this.cycleWords = this.cycleWords.bind(this);
    this.playPause = this.playPause.bind(this);
    this.stop = this.stop.bind(this);
    this.start = this.start.bind(this);
    this.convertWpmToMs = this.convertWpmToMs.bind(this);
  }

  public render() {
    const currentWord = this.state.textArray[
      this.state.textIndex % this.state.textArray.length
    ];
    const playText = this.state.play ? 'Pause' : 'Play';

    return (
      <div>
        <label>
          Input Text
          <textarea
            value={this.state.text}
            onChange={this.handleTextAreaChange}
          />
        </label>
        <Button variant="contained" color="primary" onClick={this.playPause}>
          {playText}
        </Button>
        <label>
          Words per minute
          <input
            type="number"
            min="1"
            max="2000"
            value={this.state.wpm}
            onChange={this.handleWpmChange}
          />
        </label>
        <h4>{this.state.text}</h4>
        <br />
        <h1>{currentWord}</h1>
      </div>
    );
  }

  public componentDidMount() {
    if (this.state.play) {
      this.start();
    }
  }

  public componentWillUnmount() {
    this.stop();
  }

  private playPause(): void {
    if (!this.state.wpm) {
      return;
    }

    if (
      !this.state.play &&
      this.state.textIndex >= this.state.textArray.length - 1
    ) {
      this.setState({
        textIndex: 0,
      });
    }

    if (!this.state.play && !this.interval) {
      this.start();
    } else if (this.state.play && this.interval) {
      this.stop();
    }
  }

  private handleTextAreaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.stop();

    this.setState({
      text: event.target.value,
      textArray: event.target.value.split(' '),
      textIndex: 0,
    });
  }

  private handleWpmChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/-/g, '');
    const wpm = parseInt(value);

    if (!value.length || (value.length === 1 && wpm <= 0)) {
      this.stop();
      this.setState({
        speed: 100000,
        wpm: isNaN(wpm) ? undefined : wpm,
      });
    } else {
      const shouldPlay = !!this.state.wpm;
      this.setState(
        {
          speed: this.convertWpmToMs(wpm),
          wpm,
        },
        () => {
          if (shouldPlay) { // maybe get rid of this callback
            this.stop();
            this.start();
          }
        }
      );
    }
  }

  private stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
    this.setState({
      play: false,
    });
  }

  private start(): void {
    this.setState({
      play: true,
    });
    this.interval = setInterval(() => this.cycleWords(), this.state.speed);
  }

  private cycleWords(): void {
    if (this.state.textIndex >= this.state.textArray.length - 1) {
      this.stop();
    } else {
      this.setState(prev => ({
        textIndex: prev.textIndex + 1,
      }));
    }
  }

  private convertWpmToMs(wpm: number): number {
    return (1 / (wpm / 60)) * 1000;
  }
}
