import {
  Button,
  createStyles,
  CssBaseline,
  Grid,
  Paper,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import {
  createMuiTheme,
  MuiThemeProvider,
  responsiveFontSizes,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';
import React from 'react';
import shortid from 'shortid';
import Application from './head';

const styles = (t: Theme) =>
  createStyles({
    margin: {
      margin: t.spacing(1),
    },
    paper: {
      color: t.palette.text.secondary,
      margin: t.spacing(3),
      padding: t.spacing(2),
      textAlign: 'left',
    },
    red: {
      // backgroundColor: red[50],
      borderBottom: 'solid',
      borderTop: 'solid',
      color: red[500],
    },
    root: {
      flexGrow: 1,
    },
  });

let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

class Home extends React.Component<
  WithStyles<typeof styles>,
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

  constructor(props: WithStyles<typeof styles>) {
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
    this.highlightLetter = this.highlightLetter.bind(this);
    this.dynamicInterval = this.dynamicInterval.bind(this);
    this.resetInterval = this.resetInterval.bind(this);
  }

  public render() {
    const { classes } = this.props;
    const currentWord = this.state.textArray[
      this.state.textIndex % this.state.textArray.length
    ];
    const higlightIndex = this.highlightLetter(currentWord);
    const playText = this.state.play ? 'Pause' : 'Play';

    return (
      <React.Fragment>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Application />
          <div className={classes.root}>
            <Grid container spacing={3} alignItems="flex-end" justify="center">
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Grid item>
                    <TextField
                      className={classes.margin}
                      multiline
                      fullWidth
                      rows={5}
                      rowsMax={15}
                      variant="outlined"
                      label="Text to read"
                      value={this.state.text}
                      onChange={this.handleTextAreaChange}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      className={classes.margin}
                      label="Words per minute"
                      type="number"
                      value={this.state.wpm}
                      onChange={this.handleWpmChange}
                    />
                    <Button
                      className={classes.margin}
                      variant="contained"
                      color="primary"
                      onClick={this.playPause}
                    >
                      {playText}
                    </Button>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper className={classes.paper}>
                  {currentWord && (
                    <Typography align="center" variant="h1">
                      {currentWord.split('').map((c, i) => (
                        <span
                          key={shortid.generate()}
                          className={i === higlightIndex ? classes.red : ''}
                        >
                          {c}
                        </span>
                      ))}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </div>
        </MuiThemeProvider>
      </React.Fragment>
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
      textArray: event.target.value.trim().split(/\s+/g),
      textIndex: 0,
    });
  }

  private handleWpmChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/-/g, '');
    const wpm = parseInt(value);

    if (!value.length || new RegExp(/^0+$/).test(value)) {
      this.setState(
        {
          speed: 100000,
          wpm: 0,
        },
        this.resetInterval
      );
    } else {
      this.setState(
        {
          speed: this.convertWpmToMs(wpm),
          wpm,
        },
        this.resetInterval
      );
    }
  }

  private stop(): void {
    if (this.interval) {
      clearTimeout(this.interval);
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
    this.dynamicInterval();
  }

  private resetInterval(): void {
    if (this.state.play) {
      this.stop();
      this.start();
    }
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

  private highlightLetter(word: string): number {
    if (!word || word.length === 0) {
      return 0;
    } else if (word.length < 3) {
      return word.length - 1;
    } else if (word.length < 5) {
      return 1;
    } else {
      return 2;
    }
  }

  private dynamicInterval(): void {
    this.interval = setTimeout(() => {
      this.cycleWords();
      return this.dynamicInterval();
    }, this.state.speed);
  }
}

export default withStyles(styles)(Home);
