import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from "react";
import mojs from "mo-js";

import styles from "./index.css";
import userCustomStyles from './usage.css';

const useAnimation = ({ clapEl, countEl, clapTotalEl }) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    () => new mojs.Timeline()
  );

  useEffect(() => {
    if (!clapEl || !countEl || !clapTotalEl) {
      return;
    }
    const tlDuration = 300;

    const scaleButton = new mojs.Html({
      el: clapEl,
      duration: tlDuration,
      scale: { 1.3: 1 },
      easing: mojs.easing.ease.out,
    });

    const countAnimation = new mojs.Html({
      el: countEl,
      duration: tlDuration,
      delay: (3 * tlDuration) / 2,
      opacity: { 0: 1 },
      y: { 0: -30 },
    }).then({
      opacity: { 1: 0 },
      y: -100,
      delay: tlDuration * 2,
    });

    const clapCountTotal = new mojs.Html({
      el: clapTotalEl,
      duration: tlDuration,
      delay: (3 * tlDuration) / 2,
      opacity: { 0: 1 },
      y: { 0: -3 },
    });

    const animatedBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      opacity: { 0: 1 },
      children: {
        shape: "polygon",
        radius: { 6: 0 },
        stroke: "rgba(211,54,0,0.8)",
        strokeWidth: 2,
        angle: 210,
        speed: 0.2,
        delay: 30,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: tlDuration,
      },
    });

    const circleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 75 },
      angle: 25,
      duration: tlDuration,
      children: {
        shape: "circle",
        fill: "rgba(149,165,166,0.8)",
        delay: 30,
        speed: 0.2,
        radius: { 0: 3 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
      },
    });

    clapEl.style.transform = "scale(1,1)";

    const newAnimationTimeline = animationTimeline.add([
      scaleButton,
      clapCountTotal,
      countAnimation,
      animatedBurst,
      circleBurst,
    ]);

    setAnimationTimeline(newAnimationTimeline);
  }, [clapEl, countEl, clapTotalEl]);

  return animationTimeline;
};

// create a context, a sort of pipe
// to pass all properties down to the childrens
// components
const MediumClapContext = React.createContext();
const { Provider } = MediumClapContext;

const MediumClap = ({ children, 
                      handleClap, 
                      values = null, 
                      style: userStyles = {}, 
                      className }) => {
  const initialState = {
    isClicked: false,
    count: 0,
    countTotal: 267,
  };

  const MAXIMUM_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal, isClicked } = clapState;

  const [{ clapRef, clapCountRef, clapTotalRef }, setRefState] = useState({});

  const setRef = useCallback((node) => {
    setRefState((prevRefState) => ({
      ...prevRefState,
      [node.dataset.refkey]: node,
    }));
  }, []);

  const animationTimeline = useAnimation({
    clapEl: clapRef,
    countEl: clapCountRef,
    clapTotalEl: clapTotalRef,
  });

  // create a useRef variable to check
  // if is the first time that is rendered 
  // and not call functions inside useEffect
  // we use useref cause it save the value
  // between multiple rerender 
  // and when we change his value
  // we don't cause a rerender
  // https://medium.com/trabe/react-useref-hook-b6c9d39e2022
  let isFirstTime = useRef(true);

  useEffect(() => {
    if (!isFirstTime.current && !isControlled) {
      handleClap && handleClap(clapState);
    }

    isFirstTime.current = false;
  }, [count, isControlled, handleClap])

  // is controlled component?
  const isControlled = !!values && handleClap;

  const handleClapClick = () => {
    animationTimeline.replay();
    isControlled 
      ? handleClap() 
      : setClapState({
          isClicked: true,
          count: count < MAXIMUM_USER_CLAP ? count + 1 : count,
          countTotal: countTotal < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
        });
  };

  // if is controlled we take the state passed down to component
  // if not we use the internal state
  const getState = () => isControlled ? values : clapState

  const memoizedValue = useMemo(() => {
    return {
      ...getState(), 
      setRef
    }
  }, [isControlled, values, clapState, setRef]);

  // use array to concatenate string is better than
  // use string concatenation inside html like code in jsk
  // it's cleaner
  const classes = [styles.clap, className].join(' ').trim();

  return (
    // useful to pass all the properties down to all childrens
    // with context
    <Provider value={memoizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={classes}
        onClick={handleClapClick}
        style={userStyles}
      >
        {children}
        {/* <ClapIcon isClicked={isClicked} setRef={setRef} />
      <ClapCount count={count} setRef={setRef} />
      <CountTotal countTotal={countTotal} setRef={setRef} /> */}
      </button>
    </Provider>
  );
};

const Usage = () => {

  const initialState = {
    isClicked: false,
    count: 0,
    countTotal: 2000,
  };


  const [state, setState] = useState(initialState);

  const MAXIMUM_USER_CLAP = 4000;
  const {isClicked, count, countTotal} = state;
  const handleClap = () => {
    setState({
      isClicked: true,
      count: count < MAXIMUM_USER_CLAP ? count + 1 : count,
      countTotal: countTotal < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
    })  
  }


  // {
  //   isClicked: true,
  //   count: count < MAXIMUM_USER_CLAP ? count + 1 : count,
  //   countTotal: countTotal < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
  // }

  return (
    <div style={{width: '100%'}}>
      <MediumClap values={state} handleClap={handleClap} className={userCustomStyles.clap}>
        <ClapIcon className={userCustomStyles.icon} />
        <ClapCount className={userCustomStyles.count} />
        <CountTotal className={userCustomStyles.total} />
      </MediumClap>
      <MediumClap values={state} handleClap={handleClap} className={userCustomStyles.clap}>
        <ClapIcon className={userCustomStyles.icon} />
        <ClapCount className={userCustomStyles.count} />
        <CountTotal className={userCustomStyles.total} />
      </MediumClap>
      <div className={styles.info}>{`You have clapped ${count} times`}</div>
    </div>
  );
};

export default Usage;

const ClapIcon = ({ style: userStyles = {}, className }) => {
  // takes properties from context using provider from 
  // parent mediumClap component
  const { isClicked } = useContext(MediumClapContext);
  const classes = [styles.icon, isClicked ? styles.checked : '', className].join(' ').trim();
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-549 338 100.1 125"
        className={classes}
        style={userStyles}
      >
        <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
        <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
      </svg>
    </span>
  );
};

const ClapCount = ({ style: userStyles = {}, className }) => {
  const { count, setRef } = useContext(MediumClapContext);
  const classes = [styles.count, className].join(' ').trim();
  return (
    <span ref={setRef} data-refkey="clapCountRef" className={classes} style={userStyles}>
      + {count}
    </span>
  );
};

const CountTotal = ({ style: userStyles = {}, className }) => {
  const { countTotal, setRef } = useContext(MediumClapContext);
  const classes = [styles.total, className].join(' ').trim();
  return (
    <span ref={setRef} data-refkey="clapTotalRef" className={classes} style={userStyles}>
      {countTotal}
    </span>
  );
};
