export const MAX_X: number = 4;
export const MAX_Y: number = 4;

export const COMMANDS = {
  PLACE: "PLACE",
  MOVE: "MOVE",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  REPORT: "REPORT",
};

export const COMMAND_REGEXP = "^(MOVE|LEFT|RIGHT|REPORT)\\s*$";
export const PLACE_CMD_REGEXP =
  "^(PLACE)\\s+([0-4])\\s*,\\s*([0-4])\\s*,\\s*(NORTH|SOUTH|EAST|WEST)$";

export const FACE_DIRECTIONS = {
  NORTH: "NORTH",
  WEST: "WEST",
  EAST: "EAST",
  SOUTH: "SOUTH",
};

export const FACE_DIRECTION_STR = {
  "0": FACE_DIRECTIONS.NORTH,
  "90": FACE_DIRECTIONS.EAST,
  "180": FACE_DIRECTIONS.SOUTH,
  "270": FACE_DIRECTIONS.WEST,
};

export const DIRECTION_INCREMENTS = {
  [FACE_DIRECTIONS.NORTH]: 1,
  [FACE_DIRECTIONS.EAST]: 1,
  [FACE_DIRECTIONS.SOUTH]: -1,
  [FACE_DIRECTIONS.WEST]: -1,
};
