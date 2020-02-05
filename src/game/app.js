import './utils/index';
import './utils/pixiUtil';
import './modules/store';
import './modules/cloud';
import './modules/sound';
import './modules/open';
import { stage, ticker, monitor, screen } from './core';
import { preload, home, game, test } from './scenes';


let pointer = null;

const initRouter = ()=> {
    if(pointer) {
        return;
    }
    monitor
        .on('scene:go', (name, opt = {}) => {
            switch (name) {
            case 'preload': {
                pointer = preload;
                preload.show(opt);
                break;
            }
            case 'home': {
                pointer = home;
                home.show(opt);
                break;
            }
            case 'game': {
                pointer = game;
                game.show(opt);
                break;
            }
            }
        });
    monitor.emit('scene:go', 'preload');
};

wx.onShow(info => {
    monitor.emit('wx:show', info);
    initRouter();
});

const setShare = ()=> {
    wx.showShareMenu({withShareTicket: true});
    wx.onShareAppMessage(() => ({
        title: '努力跳得更高...',
        query: `id=${wx.$store.openId}`,
        imageUrl: [
            'http://bearfile.codebear.cn/jump/wxshare.png'
        ][~~(Math.random() * 1)]
    }));
    
    monitor.on('wx:share', opt => {
        if (opt.query) {
            opt.query += `&id=${wx.$store.openId}`;
        }
        wx.shareAppMessage(Object.assign({
            title: '努力跳得更高...',
            query: `id=${wx.$store.openId}`,
            imageUrl: [
                'http://bearfile.codebear.cn/jump/wxshare.png'
            ][~~(Math.random() * 1)]
        }, opt));
    });
};

const playBgm = async ()=> {
    wx.$sound.coutdown = wx.$sound.load(
        'static/sounds/coutdown.mp3',
        { volume: 1, autoDestroy: false }
    );
    wx.$sound.coutdown_end = wx.$sound.load(
        'static/sounds/coutdown_end.mp3',
        { volume: 1, autoDestroy: false }
    );
    wx.$sound.tap = wx.$sound.load(
        'static/sounds/jump.mp3',
        { volume: .5, autoDestroy: false }
    );
    wx.$sound.score = wx.$sound.load(
        'static/sounds/score.mp3',
        { volume: 1, autoDestroy: false }
    );
    wx.$sound.shielding = wx.$sound.load(
        'static/sounds/shielding.mp3',
        { volume: 1, autoDestroy: false }
    );
    wx.$sound.fail = wx.$sound.load(
        'static/sounds/fail.mp3',
        { volume: 1, autoDestroy: false }
    );

    const bgm = wx.$sound.load(
        'http://bearfile.codebear.cn/jump/bgm2.mp3',
        {
            volume: .5,
            loop: true,
            canplay: async ()=> {
                await wx.$util.delay(100);
                !wx.$store.muted && bgm.play();
            }
        }
    );
    
    monitor.on('wx:show', async () => {
        !wx.$store.muted && bgm.play();
    }).on('sound:muted', async () => {
        if (wx.$store.muted) {
            bgm.stop();
        } else {
            bgm.play();
        }
    });
    wx.onAudioInterruptionEnd(()=> {
        !wx.$store.mute && bgm.play();
    });
};

/**
 * 游戏圈
 */
const createGameCenterButton = async ()=> {
    const button = wx.createGameClubButton({
        icon: 'white',
        style: {
            left: 10,
            top: screen.height * 0.2,
            width: 40,
            height: 40
        }
    });
    
    button.hide();
    
    monitor
        .on('scene:show', name => name === 'home' ? button.show() : button.hide())
        .on('scene:hide', name => name === 'home' && button.hide());
};

/**
 * 检查更新
 */
const checkUpdate = ()=> {
    const manager = wx.getUpdateManager();
    manager.onUpdateReady(() => {
        manager.applyUpdate();
    });
};

checkUpdate();
setShare();
playBgm();
createGameCenterButton();
