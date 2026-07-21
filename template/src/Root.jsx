import React from "react";
import { Composition } from "remotion";
import { DUR_FRAMES, EarningsVideo } from "./Video.jsx";

export const Root = () => (
  <Composition
    id="EarningsWeek"
    component={EarningsVideo}
    durationInFrames={DUR_FRAMES}
    fps={30}
    width={1080}
    height={1080}
  />
);
