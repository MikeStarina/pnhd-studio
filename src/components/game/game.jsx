/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Group, Image } from 'react-konva';
import styles from './game.module.css';
import Konva from 'konva';
import ufo from '../../components/images/ufo.svg';
import house from '../../components/images/house.png';
import gamebg from '../../components/images/gamebg.png';
import gamelogo from '../../components/images/gamelogo.png';
import tee from '../../components/images/tee.png';
import grass from '../../components/images/grass.png';
import useImage from 'use-image';
import useSound from 'use-sound';
import coinSnd from '../../components/sounds/coin.mp3';
import crashSnd from '../../components/sounds/crash.mp3';
import startSnd from '../../components/sounds/music.mp3';
import jumpSnd from '../../components/sounds/jump.mp3';

const Game = () => {
    console.log('rendered');
    const enemiesGenerator = () => {
        const count = Math.floor(Math.random() * (6 - 3)) + 3;
        let array = [];

        for (let i = 0; i < count; i++) {
            if ( i === 0 ) array[i] = 0;
            if ( i > 0 ) array[i] = Math.floor(Math.random() * ((array[i - 1] + 800) - (array[i - 1] + 250))) + (array[i - 1] + 250);
        }

        return array;
    }
   
    
    const coinsGenerator = () => {
        const count = Math.floor(Math.random() * (5 - 3)) + 3;
        let genCoins = [];
        for (let i = 0; i < count; i++) {
           
            if (i === 0) {
                genCoins[i] = Math.floor(Math.random() * (500 - 200)) + 200;
                //enemies[i] = Math.floor(Math.random() * (2000 - 1000)) + 1000;
            }
            if (i > 0) {
                genCoins[i] = Math.floor(Math.random() * ((genCoins[i - 1] + 800) - (genCoins[i - 1] + 250)) + (genCoins[i - 1] + 250))
                
               
            }
            //console.log(genCoins[i]);
        }
        //console.log(genCoins);
        return genCoins;
    }
    
    const [ basicCoinColor ] = useState('rgb(0,255,0)')
    const [ basicSpeed, setBasicSpeed ] = useState(0);
    const [ bgSpeed, setBgSpeed ] = useState(0.5);
    const [ speed, setSpeed ] = useState(0);
    const [ gameIteration, setGameIteration ] = useState(0);
    const [ x, setX ] = useState(1000);
    const [ y, setY ] = useState(430);
    const [ enemies, setEnemies ] = useState();
    const [ coins, setCoins ] = useState();
    const [ wasted, setWasted ] = useState(false);
    const [ gameScore, setGameScore ] = useState(0);
    const [ playerImage ] = useImage(ufo, 'Anonymous');
    const [ houseImage ] = useImage(house, 'Anonymous');
    const [ game_bg ] = useImage(gamebg, 'Anonymous');
    const [ tshirt ] = useImage(tee, 'Anonymous');
    const [ grassbg ] = useImage(grass, 'Anonymous');
    //console.log(enemies);

    const [ playCoinSound ] = useSound(coinSnd, { volume: 0.5, interrupt: true });
    const [ playCrashSound ] = useSound(crashSnd, { volume: 0.5 });
    const [ playStartSound, ExposedData ] = useSound(startSnd, { volume: 0.3, interrupt: true });
    const [ playJumpSound ] = useSound(jumpSnd, { volume: 0.5 });
 


    const player = useRef(null);
    const stage = useRef(null);
    const score = useRef(null);
    const actionLayer = useRef(null);
    const enemy = useRef(null);
    const bgRef = useRef(null);
    const grassRef = useRef(null);


    useEffect(() => {
        //playCoinSound();
        //console.log(gameScore);
    }, [gameScore])

   

    useEffect(() => {
        setEnemies([...enemiesGenerator()]);
        setCoins([...coinsGenerator()]);
        actionLayer.current.attrs.x = 1000;
        //console.log(actionLayer.current);

        const bg = bgRef.current;
        const bganimation = bg && new Konva.Tween({
            node: bg,
            x: -1000,
            duration: 100 / bgSpeed,
            onFinish: () => {
                bganimation.destroy();
            }
        })
      
        
        const grsAnimation = grass && new Konva.Tween({
            node: grassRef.current,
            x: -1500,
            duration: 1500 / (bgSpeed * 20),
            onUpdate: () => {
                //console.log('grass');
            },
            onFinish: () => {
                grsAnimation.destroy();
            }
        })

                   // bg && !wasted && speed && a.play();
        const animation = new Konva.Tween({
            node: actionLayer.current,
            x: -3000,
            duration: 4000 / basicSpeed,
            onFinish: () => {
                
                setBasicSpeed(basicSpeed + 20);
                animation.destroy();
            },
            onUpdate: () => {
                //console.log('is playing?')
                const houses = actionLayer.current.children[0]?.children;
                const greens = actionLayer.current.children[1]?.children;
                houses?.forEach((item) => {
                   
                    const realX = actionLayer.current.attrs.x + item.attrs.x;
                    if (player.current.attrs.x - realX > -40 && player.current.attrs.x - realX < 70) {
                       
                        //console.log(player.current.attrs.x - enemy.attrs.x);
                        
                        if (player.current.attrs.y > 330) {
                            playCrashSound();
                            setWasted(true);
                            ExposedData.stop();
                            animation.pause();
                            
                        }
                    }
                })

                greens?.forEach((item) => {item.attrs.fill = basicCoinColor;
                    const realX = actionLayer.current.attrs.x + item.attrs.x;
                    if (player.current.attrs.x - realX > -50 && player.current.attrs.x - realX < 50) {
                    
                                        //console.log(player.current.attrs.x - enemy.attrs.x);
                                        //console.log(item.attrs)
                                        if (player.current.attrs.y - item.attrs.y > -50 && player.current.attrs.y - item.attrs.y < 50) {
                                            //item.attrs.visible = false;
                                            //item.attrs.fill = 'rgba(0,255,0,0.3)';
                                            console.log('score up');
                                            //playCoinSound();
                                            const newScore = gameScore + 100;
                                            setGameScore(newScore);
                                            //item.attrs.y = -10;
                                            //item.attrs.opacity = '0.3';   
                                            //console.log(item.attrs.opacity);                                
                                            //console.log(item.attrs.x);
                                            playCoinSound();
                                            item.destroy();
                                            const intScore = parseInt(score.current.textContent);
                                            score.current.textContent = intScore + 100;
                                        }
                                    }
                     
                })
               

            }
        })

        enemies && coins && animation.play() && bganimation.play() && grsAnimation.play();
        playStartSound();
    }, [basicSpeed])

   
    
    useEffect(() => {

        const handler = (e) => {
            e.preventDefault();
            //console.log(e.key);
            if(e.key === ' ' && player.current.attrs.y === 430 && basicSpeed !== 0) {
                playJumpSound();
                //console.log(e.key);
                //console.log(speed);
                
                const up = new Konva.Tween({
                    node: player.current,
                    duration: 0.4,
                    easing: Konva.Easings.EaseOut,
                    y: 200,
                    onFinish: () => {up.reverse()}
                });
                
                up.play(); 

               


            }
        }

      
        window.addEventListener('keydown', handler);
        

        return () => {
            window.removeEventListener('keydown', handler);
           
        }
    }, [speed, basicSpeed, enemies, coins])
    /*
    useEffect = (() => {
        console.log(enemy.current);
    }, [])
    */

    useEffect(() => {
        //stage.current.clearRect;
        //actionLayer.current.clearRect;
        setEnemies(...[]);
        setCoins(...[]);
        setSpeed(0);
        setWasted(false);
        setBasicSpeed(0)
        !wasted && ExposedData.stop();
    }, [wasted])


   

    const gameStart = () => {
        //playStartSound();
        //stage.current.clearRect;
        //actionLayer.current.clearRect;
        //ExposedData.stop();
        setWasted(false);
        setSpeed(1);
        setEnemies([...enemiesGenerator()]);
        setCoins([...coinsGenerator()]);
        setGameIteration(gameIteration + 1);   
        setBasicSpeed(300);
        score.current.textContent = 0;
        
    }
    const gameReStart = () => {
        function refreshPage() {
            window.location.reload(false);
        }
        refreshPage();
    }

    const randomKeyFunc = () => {
        const key = Math.floor(Math.random() * (1000000 - 1000)) + 1000;
        return key;
    }

   




    //console.log(coins);
  return (
    <section className={styles.page}>
        <div className={styles.container}>
      <Stage
        width={1000}
        height={500}
        className={styles.stage}
        ref={stage}
        onClick={() => {
            //console.log(stage.current);
            const playerChild = stage.current.children[1].children[1];
            //console.log(playerChild.attrs.y);
            if (playerChild.attrs.y === 430) {
                const up = new Konva.Tween({
                    node: playerChild,
                    duration: 0.4,
                    easing: Konva.Easings.EaseOut,
                    y: 200,
                    onFinish: () => {up.reverse()}
                })
                playJumpSound();
                speed > 0 && up.play();
                   
            }
            //up.destroy();
        }}
        
      >
        <Layer>
            <Image
                image={game_bg}
                width={2000} 
                height={1000}
                y={0}
                x={0}
                opacity={0.2}
                ref={bgRef}
            />
             <Image
                width={2500}
                height={70}
                opacity={1}
                x={0}
                y={442}
                image={grassbg}
                ref={grassRef}
            />
        </Layer>
        <Layer
            width={1000}
            height={500}
            className={styles.main_layer}
            border
        >
            
            <Group
                width={3000}
                height={500}
                x={1000}
                y={0}
                ref={actionLayer}
            >
                 
            {enemies && 
                <Group>
                {enemies.map((item, index) => {

                    return (
                        <Image
                            x={item}
                            y={380}
                            width={80}
                            height={100}
                            image={houseImage}
                            key={index}                    
                            ref={enemy}
                        />)
                
                })}
                </Group>
            }
           {coins &&
                <Group>
                {coins.map((item, index) => {
                return (
                    <Image
                        x={item}
                        y={300}
                        width={30}
                        height={26}
                        key={randomKeyFunc()}
                        image={tshirt}
                        shadowColor='rgba(0,255,0,.8)'
                        shadowBlur={5}
                        ref={(node) => {

                        }}
                    />
                )
                })}
                </Group>
            }

           
            </Group>
            <Group x={speed === 0 ? 475 : 20}
                y={y}
                width={50}
                height={50}
                ref={player}
            >
                 <Image
                    width={50}
                    height={50}
                    image={playerImage}
                    shadowColor='rgba(0,255,0,.8)'
                    shadowBlur={5}
                  />
            

            </Group>
            
           
        </Layer>
        <Layer>
           
            <Rect
                x={0}
                y={480}
                width={1000}
                height={20}
                opacity={0.4}
                fill="gray"
            />
            
        </Layer>
        
      </ Stage>
      <div className={gameIteration === 0 && speed === 0 && gameScore === 0 ? styles.menu_active : styles.menu_disabled}>
            <img src={gamelogo} alt='game logo' className={styles.logo}></img>
            <p className={styles.final_score}>You're an Alien from a far away planet with no tshirts on it. Try to find it on Earth!</p>
            <button type='button' className={styles.button} onClick={gameStart}>Start</button>
      </div>
      <div className={gameIteration !== 0 && speed === 0 ? styles.menu_active : styles.menu_disabled}>
            <img src={gamelogo} alt='game logo' className={styles.logo}></img>
            <p className={styles.final_score}>Your score: {score?.current?.textContent}</p>
            <p className={styles.final_score}>one more time?</p>
            <button type='button' className={styles.button} onClick={gameStart}>Restart</button>
      </div>
        <p className={styles.score} ref={score}>0</p>
      </div>
      
    </section>
  );
}

export default Game;
