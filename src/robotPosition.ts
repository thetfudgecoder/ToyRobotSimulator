import { FACE_DIRECTION_STR } from "./constants";

export type RobotPositionValue = {
  x: number | undefined;
  y: number | undefined;
  facePos: number | undefined;
};

/**
 * singleton instance that holds current position of the robot
 */
let instance: ReturnType<typeof initPosition<RobotPositionValue>>;

/**
 * initialises default robot position
 */
const initPosition = <T>() => {
  let x: number | undefined;
  let y: number | undefined;
  let facePos: number | undefined;

  return {
    getX: (): number | undefined => x,
    getY: (): number | undefined => y,
    getFacePos: (): number | undefined => facePos,
    getFacePosStr: (): string | undefined =>
      FACE_DIRECTION_STR[String(facePos)],

    setX: (value: number) => (x = value),
    setY: (value: number) => (y = value),
    setFacePos: (value: number) => (facePos = value),
  };
};

/**
 * Returns instance of the singleton that holds position of the robot
 */
const robotPosition = () => {
  if (!instance) {
    instance = initPosition<RobotPositionValue>();
    return instance;
  }
  return instance;
};

export default robotPosition;
