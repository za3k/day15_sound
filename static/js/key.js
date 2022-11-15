"use strict";

var keycodes={backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,pausebreak:19,capslock:20,esc:27,space:32,pageup:33,pagedown:34,end:35,home:36,leftarrow:37,uparrow:38,rightarrow:39,downarrow:40,insert:45,delete:46,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,leftwindowkey:91,rightwindowkey:92,selectkey:93,numpad0:96,numpad1:97,numpad2:98,numpad3:99,numpad4:100,numpad5:101,numpad6:102,numpad7:103,numpad8:104,numpad9:105,multiply:106,add:107,subtract:109,decimalpoint:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,numlock:144,scrolllock:145,semicolon:186,equalsign:187,comma:188,dash:189,period:190,forwardslash:191,graveaccent:192,openbracket:219,backslash:220,closebracket:221,singlequote:222};

class Keys {
    freeKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
                "a", "s", "d", "f", "g", "h", "j", "k", "l",
                "z", "x", "c", "v", "b", "n", "m"];
    constructor() {
        this.keyDowns = {};
        this.keyUps = {};
        this.keyShiftDowns = {};
        this.keyShiftUps = {}
        this.keyCtrlDowns = {};
        this.keyCtrlUps = {};
        this.mods = {};
        this.setMods({}); // Lazy hack
        $(document).keyup((ev) => {
            const mods = this.setMods(ev);
            if (mods.none && this.keyUps[ev.which]) this.keyUps[ev.which](this.mods);
            if (mods.shiftOnly && this.keyShiftUps[ev.which]) this.keyShiftUps[ev.which](this.mods);
        });
        $(document).keydown((ev) => {
            const mods = this.setMods(ev);
            if (mods.none && this.keyDowns[ev.which]) this.keyDowns[ev.which](this.mods);
            if (mods.shiftOnly && this.keyShiftDowns[ev.which]) this.keyShiftDowns[ev.which](this.mods);
        });
    }
    bindKey(e, key, actions) {
        if (!key) key = this.nextFreeKey();
        e.innerHTML = key;
        this.keyDowns[keycodes[key]] = actions.down;
        this.keyUps[keycodes[key]] = actions.up;
        this.keyShiftDowns[keycodes[key]] = actions.shiftDown;
        this.keyShiftUps[keycodes[key]] = actions.shiftUp;
        this.keyCtrlDowns[keycodes[key]] = actions.ctrlDown;
        this.keyCtrlUps[keycodes[key]] = actions.ctrlUp;

        e.onmousedown = () => {
            if (this.mods.none && actions.mouseDown) actions.mouseDown();
            if (this.mods.shiftOnly && actions.shiftMouseDown) actions.shiftMouseDown();
            if (this.mods.ctrlOnly && actions.ctrlMouseDown) actions.ctrlMouseDown();

            $(document).on("mouseup", () => {
                if (this.mods.none && actions.mouseUp) actions.mouseUp();
                if (this.mods.shiftOnly && actions.shiftMouseUp) actions.shiftMouseUp();
                if (this.mods.ctrlOnly && actions.ctrlMouseUp) actions.ctrlMouseUp();
                $(document).off("mouseup");
            });
        };
    }
    setMods(ev) {
        const mods = {shift: ev.shiftKey, meta: ev.metaKey, ctrl: ev.ctrlKey, alt: ev.altKey};
        if(this.mods.shift != ev.shiftKey && this.onShift) this.onShift(ev.shiftKey);
        if(this.mods.ctrl != ev.ctrlKey && this.onCtrl) this.onCtrl(ev.ctrlKey);
        mods.none = !mods.shift && !mods.meta && !mods.ctrl && !mods.alt;
        mods.shiftOnly = mods.shift && !mods.meta && !mods.ctrl && !mods.alt;
        mods.metaOnly  = !mods.shift && mods.meta && !mods.ctrl && !mods.alt;
        mods.ctrlOnly  = !mods.shift && !mods.meta && mods.ctrl && !mods.alt;
        mods.altOnly   = !mods.shift && !mods.meta && !mods.ctrl && mods.alt;
        this.mods = mods;
        return this.mods;
    }
    nextFreeKey() {
        const key = this.freeKeys[0];
        this.freeKeys = this.freeKeys.slice(1);
        return key;
    }
}
