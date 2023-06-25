import { expect } from "@jest/globals";
import robotPosition from "../../src/robotPosition";
import { runCmd } from "../../src/app";
import { COMMANDS, MAX_X, MAX_Y } from "../../src/constants";

describe("Test if main function that handles commands produces proper results", () => {
  const robotPos = robotPosition();

  const verifyPosition = (x: number, y: number, facePos: number) => {
    expect(robotPos.getX()).toBe(x);
    expect(robotPos.getY()).toBe(y);
    expect(robotPos.getFacePos()).toBe(facePos);
  };

  beforeEach(() => {
    robotPos.setFacePos(undefined);
    robotPos.setX(undefined);
    robotPos.setY(undefined);
  });

  it("test scenario from examples A", async () => {
    const commands = ["PLACE 0,0,NORTH", "MOVE", "REPORT"];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(0, 1, 0);
  });

  it("test scenario from examples B", async () => {
    const commands = ["PLACE 0,0,NORTH", "LEFT", "REPORT"];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(0, 0, 270);
  });

  it("test scenario from examples C", async () => {
    const commands = [
      "PLACE 1,2,EAST",
      "MOVE",
      "MOVE",
      "LEFT",
      "MOVE",
      "REPORT",
    ];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(3, 3, 0);
  });

  it("should ignore all the commands", async () => {
    runCmd(COMMANDS.RIGHT);
    runCmd(COMMANDS.LEFT);
    runCmd(COMMANDS.MOVE);
    verifyPosition(undefined, undefined, undefined);
  });

  it("should ignore bad command input", async () => {
    runCmd("lEfT");
    runCmd("MOVE 0,0,EAST");
    runCmd("move");
    runCmd("RIGHTT");
    verifyPosition(undefined, undefined, undefined);
  });

  it("should ignore bad format of PLACE command", async () => {
    runCmd("PLACE0,0,EAST");
    verifyPosition(undefined, undefined, undefined);

    runCmd(`PLACE ${MAX_X + 1},0,EAST`);
    verifyPosition(undefined, undefined, undefined);

    runCmd(`PLACE 0,${MAX_Y + 1},EAST`);
    verifyPosition(undefined, undefined, undefined);

    runCmd("PLACE -2,0,EAST");
    verifyPosition(undefined, undefined, undefined);

    runCmd("PLACE 0,-1,EAST");
    verifyPosition(undefined, undefined, undefined);

    runCmd("PLACE 0,0,AEST");
    verifyPosition(undefined, undefined, undefined);

    runCmd("LPACE 0,0,EAST");
    verifyPosition(undefined, undefined, undefined);

    runCmd("PLACE 0,0,,EAST");
    verifyPosition(undefined, undefined, undefined);
  });

  it("test PLACE command sets all possible configuration properly", async () => {
    runCmd("PLACE 0,0,EAST");
    verifyPosition(0, 0, 90);

    runCmd("PLACE 1,2,NORTH");
    verifyPosition(1, 2, 0);

    runCmd("PLACE 2,3,WEST");
    verifyPosition(2, 3, 270);

    runCmd("PLACE 3,4,SOUTH");
    verifyPosition(3, 4, 180);
  });

  it("test LEFT and RIGHT commands proper processing", async () => {
    runCmd("PLACE 0,0,NORTH");
    verifyPosition(0, 0, 0);

    runCmd("LEFT");
    verifyPosition(0, 0, 270);

    runCmd("LEFT");
    verifyPosition(0, 0, 180);

    runCmd("LEFT");
    verifyPosition(0, 0, 90);

    runCmd("RIGHT");
    verifyPosition(0, 0, 180);

    runCmd("RIGHT");
    verifyPosition(0, 0, 270);

    runCmd("RIGHT");
    verifyPosition(0, 0, 0);
  });

  it("test MOVE stays withing board range", async () => {
    // shouldn't move left if X=0
    runCmd("PLACE 0,0,WEST");
    verifyPosition(0, 0, 270);

    runCmd("MOVE");
    verifyPosition(0, 0, 270);

    // should ignore moving down the board if Y=0
    runCmd("PLACE 0,0,SOUTH");
    verifyPosition(0, 0, 180);

    runCmd("MOVE");
    verifyPosition(0, 0, 180);

    // should ignore moving up the board if X=maxValue
    runCmd(`PLACE 0,${MAX_Y},NORTH`);
    verifyPosition(0, MAX_Y, 0);

    runCmd("MOVE");
    verifyPosition(0, MAX_Y, 0);

    // should ignore moving right the board if Y=maxValue
    runCmd(`PLACE ${MAX_X},0,EAST`);
    verifyPosition(MAX_X, 0, 90);

    runCmd("MOVE");
    verifyPosition(MAX_X, 0, 90);

    // should successfully move to the right
    runCmd(`PLACE 0,0,EAST`);
    verifyPosition(0, 0, 90);

    runCmd("MOVE");
    verifyPosition(1, 0, 90);

    // should successfully move up
    runCmd(`PLACE 0,0,NORTH`);
    verifyPosition(0, 0, 0);

    runCmd("MOVE");
    verifyPosition(0, 1, 0);

    // should successfully move to the left
    runCmd(`PLACE 1,1,WEST`);
    verifyPosition(1, 1, 270);

    runCmd("MOVE");
    verifyPosition(0, 1, 270);

    // should successfully move down
    runCmd(`PLACE 1,1,SOUTH`);
    verifyPosition(1, 1, 180);

    runCmd("MOVE");
    verifyPosition(1, 0, 180);
  });

  it("test happy scenario 1", async () => {
    const commands = [
      "  MOVE  ",
      "RIGHT    ",
      "PLACE 1    , 1,     NORTH",
      "RIGHT  ",
      "MOVE  adsf",
      "MOVE",
      "  LEFT",
      "MOVE",
      "REPORT",
    ];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(2, 2, 0);
  });

  it("test happy scenario 2", async () => {
    const commands = [
      "  MOVE  ",
      "RIGHT    ",
      "PLACE 1    , 1,     NORTH",
      "RIGHT  ",
      "MOVE",
      "MOVE  adsf",
      "PLACE 3    , 3,SOUTH",
      "REPORT",
      "MOVE",
      "LEFT",
      "MOVE",
      "REPORT",
    ];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(4, 2, 90);
  });

  it("test attempt to move robot out of the board", async () => {
    // Robot is down on the left trying to move left turn down and try to move down
    let commands = ["PLACE 0,0,WEST", "MOVE", "LEFT", "MOVE", "REPORT"];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(0, 0, 180);

    // Robot is up on the right trying to move up, turn right and try to move right
    commands = [
      `PLACE ${MAX_X},${MAX_Y},NORTH`,
      "MOVE",
      "RIGHT",
      "MOVE",
      "REPORT",
    ];

    commands.forEach((command: string) => {
      runCmd(command);
    });
    verifyPosition(MAX_X, MAX_Y, 90);
  });
});
