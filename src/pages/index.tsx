import {
  Button,
  createStyles,
  CssBaseline,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import React from 'react';
import shortid from 'shortid';
import Application from './head';

const styles = (t: Theme) =>
  createStyles({
    controlPanel: {
      alignSelf: 'flex-start',
    },
    controlTitle: {
      borderRight: `2px solid ${theme.palette.divider}`,
      margin: 'auto 0',
      marginRight: t.spacing(1),
      padding: t.spacing(1, 2),
      paddingLeft: t.spacing(1),
    },
    inside: {
      border: 'none',
      boxShadow: 'none',
    },
    margin: {
      margin: t.spacing(1),
    },
    padding: {
      padding: t.spacing(2),
    },
    paper: {
      color: t.palette.text.secondary,
      margin: t.spacing(3),
      [t.breakpoints.down('xs')]: {
        margin: t.spacing(1),
      },
      textAlign: 'left',
    },
    red: {
      // backgroundColor: red[50],
      borderBottom: 'solid',
      borderTop: 'solid',
      color: red[500],
    },
    root: {
      minHeight: '99vh',
    },
    textDisplay: {
      alignSelf: 'flex-start',
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
    playText: string;
    wpm: number | undefined;
  }
> {
  private interval: NodeJS.Timer | undefined;

  constructor(props: WithStyles<typeof styles>) {
    super(props);
    this.state = {
      play: false,
      playText: 'play',
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
    this.reset = this.reset.bind(this);
    this.stop = this.stop.bind(this);
    this.start = this.start.bind(this);
    this.convertWpmToMs = this.convertWpmToMs.bind(this);
    this.highlightLetter = this.highlightLetter.bind(this);
    this.dynamicInterval = this.dynamicInterval.bind(this);
    this.resetInterval = this.resetInterval.bind(this);
    this.setIntervalAndExecute = this.setIntervalAndExecute.bind(this);
  }

  public render() {
    const { classes } = this.props;
    const currentWord = this.state.textArray[this.state.textIndex % this.state.textArray.length];
    const higlightIndex = this.highlightLetter(currentWord);

    return (
      <React.Fragment>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Application />
          <Grid container justify="center" className={classes.root}>
            <Grid item xs={12} className={classes.controlPanel}>
              <Paper className={classes.paper}>
                <ExpansionPanel defaultExpanded className={classes.inside}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                  >
                    <Typography className={classes.controlTitle}>Controls</Typography>
                    <Button
                      className={classes.margin}
                      variant="contained"
                      color="primary"
                      onClick={this.playPause}
                    >
                      {this.state.playText}
                    </Button>
                    <Button
                      className={classes.margin}
                      variant="contained"
                      color="secondary"
                      onClick={this.reset}
                    >
                      reset
                    </Button>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
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
                      <Grid item xs={12}>
                        <TextField
                          label="Words per minute"
                          type="number"
                          value={this.state.wpm}
                          onChange={this.handleWpmChange}
                        />
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Paper>
            </Grid>
            <Grid container item xs={12} md={6} spacing={2} className={classes.textDisplay}>
              <Grid item xs={12}>
                <Paper className={clsx(classes.padding)}>
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
          </Grid>
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
    if (!this.state.play && this.state.textIndex >= this.state.textArray.length - 1) {
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

  private reset(): void {
    this.stop();
    this.setState({
      textIndex: 0,
    });
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
      playText: 'play',
    });
  }

  private start(): void {
    if (this.state.textArray.length === 0) {
      return;
    }

    let countdownStart = 3;
    const countdown = this.setIntervalAndExecute(() => {
      this.setState({
        playText: countdownStart.toString(),
      });

      if (countdownStart > 0) {
        countdownStart--;
      } else {
        clearInterval(countdown);
        this.setState({
          play: true,
          playText: 'pause',
        });
        this.dynamicInterval();
      }
    }, 1000);
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
    } else if (word.length < 6) {
      return 1;
    } else {
      return 2;
    }
  }

  private dynamicInterval(): void {
    this.interval = setTimeout(() => {
      this.cycleWords();
      if (this.interval) {
        return this.dynamicInterval();
      }
    }, this.speedWithPunctuation());
  }

  private speedWithPunctuation(): number {
    if (/[\.\;\!\?]/.test(this.state.textArray[this.state.textIndex])) {
      return this.state.speed * 1.5;
    } else if (/[,\:\-\u2012-\u2015]/.test(this.state.textArray[this.state.textIndex])) {
      return this.state.speed * 1.2;
    } else {
      return this.state.speed;
    }
  }

  private setIntervalAndExecute(f: (...args: any[]) => void, t: number) {
    f();
    return setInterval(f, t);
  }
}

export default withStyles(styles)(Home);
