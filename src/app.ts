import { argv } from "process";
import * as fs from "fs";
import * as readline from "readline";
import robotPosition from "./robotPosition";
import {
  COMMAND_REGEXP,
  COMMANDS,
  DIRECTION_INCREMENTS,
  FACE_DIRECTION_STR,
  FACE_DIRECTIONS,
  MAX_X,
  MAX_Y,
  PLACE_CMD_REGEXP,
} from "./constants";

export type AllowedCommands = "MOVE" | "LEFT" | "RIGHT" | "REPORT" | "PLACE";

/**
 * Places robot at specified location and checks if it's within the range of the board
 * @param x new X position
 * @param y new Y position
 * @param facePos new robot facing direction
 */
const placeIfInRange = (x: number, y: number, facePos?: string) => {
  if (x >= 0 && x <= MAX_X && y >= 0 && y <= MAX_Y) {
    const robotPos = robotPosition();
    robotPos.setX(x);
    robotPos.setY(y);
    if (facePos) {
      const angle: string = Object.keys(FACE_DIRECTION_STR).find(
        (key) => FACE_DIRECTION_STR[key] === facePos
      );
      robotPos.setFacePos(Number(angle));
    }
  }
};

/**
 * Handles command PLACE. Places robot at any given position if it's within the board range
 * @param position array of command and parameters. Example: [PLACE, 0, 0, EAST]
 */
const place = (position: string[]) => {
  const x = Number(position[1]);
  const y = Number(position[2]);
  const facePos: string = position[3];

  placeIfInRange(x, y, facePos);
};

/**
 * Handles command MOVE. Calculates new positions of x and y of the robot
 */
const move = () => {
  const robotPos = robotPosition();
  const x: number = robotPos.getX();
  const y: number = robotPos.getY();
  const facePos: string = robotPos.getFacePosStr();

  let newY = y;
  if (facePos === FACE_DIRECTIONS.NORTH || facePos === FACE_DIRECTIONS.SOUTH) {
    newY = y + DIRECTION_INCREMENTS[facePos];
  }

  let newX = x;
  if (facePos === FACE_DIRECTIONS.EAST || facePos === FACE_DIRECTIONS.WEST) {
    newX = x + DIRECTION_INCREMENTS[facePos];
  }

  placeIfInRange(newX, newY);
};

/**
 * Handles commands: LEFT and RIGHT. Calculates new direction of the robot facing position based on input.
 * Sets values of: [0, 90, 180, 270]
 * @param direction LEFT, RIGHT
 */
const rotate = (direction: string) => {
  const robotPos = robotPosition();
  const facePos = robotPos.getFacePos();

  if (direction === COMMANDS.LEFT) {
    robotPos.setFacePos(facePos - 90 < 0 ? 270 : facePos - 90);
  }

  if (direction === COMMANDS.RIGHT) {
    robotPos.setFacePos(facePos + 90 > 270 ? 0 : facePos + 90);
  }
};

/**
 * Handles REPORT command by printing the position of the robot. Example: 'Position: 2, 3, EAST'
 */
const report = () => {
  const robotPos = robotPosition();
  console.log(
    `Position: ${robotPos.getX()}, ${robotPos.getY()}, ${robotPos.getFacePos()}, ${robotPos.getFacePosStr()}`
  );
};

/**
 * Command handlers for convenience of use in case there will be more of them
 */
const COMMAND_HANDLERS = {
  [COMMANDS.PLACE]: place,
  [COMMANDS.MOVE]: move,
  [COMMANDS.LEFT]: rotate,
  [COMMANDS.RIGHT]: rotate,
  [COMMANDS.REPORT]: report,
};

/**
 * Will check if the command is valid and in the right format
 * @param command
 * @returns either command itself or array consisting of command and parameters
 */
const sanitiseCmdIfValid = (command: string): AllowedCommands | string[] => {
  const sanitizedCommand = command.trim();
  let match = sanitizedCommand.match(COMMAND_REGEXP);
  if (match) {
    return match?.[1] as AllowedCommands;
  }

  match = sanitizedCommand.match(PLACE_CMD_REGEXP);
  if (match) {
    return match.slice(1);
  }

  return null;
};

/**
 * Will sanitise the line or input or file and execute it if line appears to be a valid command
 * @param line
 */
export const runCmd = (line: string) => {
  const sanitisedCmd = sanitiseCmdIfValid(line);
  if (sanitisedCmd) {
    executeCommand(sanitisedCmd);
  }
};

/**
 * Checks if robot has valid position and applies proper command handler function
 * @param command
 */
const executeCommand = (command: AllowedCommands | string[]): void => {
  const robotPos = robotPosition();

  // Ignore any command except PLACE until robot has valid position
  if (
    (robotPos.getX() === undefined ||
      robotPos.getY() === undefined ||
      robotPos.getFacePos() === undefined) &&
    !Array.isArray(command)
  ) {
    return;
  }

  if (Array.isArray(command)) {
    (
      COMMAND_HANDLERS[COMMANDS.PLACE] as (
        position: string[]
      ) => NonNullable<unknown>
    )(command);
  } else {
    (
      COMMAND_HANDLERS[command] as (direction: string) => NonNullable<unknown>
    )?.(command);
  }
};

/**
 * Entry point of the application. If filename is provided - will read it line by line and execute each of them.
 * If filename wasn't provided - will initiate recursive stdin line read
 * @param filename
 */
const startRobotSimulator = (filename: string): void => {
  if (filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error(`Couldn't read file '${filename}'`);
      }

      const fileStream = fs.createReadStream(filename);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      rl.on("line", (line: string) => {
        runCmd(line);
      });

      rl.on("error", (err) => {
        console.error(`Error reading the file: ${err.message}`);
      });
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const readLine = function () {
      rl.question("> ", (cmd) => {
        runCmd(cmd);
        readLine();
      });
    };

    readLine();
  }
};

startRobotSimulator(argv?.[2]);
