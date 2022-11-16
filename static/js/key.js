"use strict";

var keycodes={backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,pausebreak:19,capslock:20,esc:27,space:32,pageup:33,pagedown:34,end:35,home:36,leftarrow:37,uparrow:38,rightarrow:39,downarrow:40,insert:45,delete:46,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,leftwindowkey:91,rightwindowkey:92,selectkey:93,numpad0:96,numpad1:97,numpad2:98,numpad3:99,numpad4:100,numpad5:101,numpad6:102,numpad7:103,numpad8:104,numpad9:105,multiply:106,add:107,subtract:109,decimalpoint:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,numlock:144,scrolllock:145,semicolon:186,equalsign:187,comma:188,dash:189,period:190,forwardslash:191,graveaccent:192,openbracket:219,backslash:220,closebracket:221,singlequote:222};

class Keys {
    actions = [
        { name: "keyDown", type: "key", down: true, condition: "none" },
        { name: "keyUp", type: "key", down: false, condition: "none" },
        { name: "keyShiftDown", type: "key", down: true, condition: "shiftOnly" },
        { name: "keyShiftUp", type: "key", down: false, condition: "shiftOnly" },
        { name: "keyCtrlDown", type: "key", down: true, condition: "ctrlOnly" },
        { name: "keyCtrlUp", type: "key", down: false, condition: "ctrlOnly" },
        { name: "mouseDown", type: "mouse", down: true, condition: "none" },
        { name: "mouseUp", type: "mouse", down: false, condition: "none" },
        { name: "mouseShiftDown", type: "mouse", down: true, condition: "shiftOnly" },
        { name: "mouseShiftUp", type: "mouse", down: false, condition: "shiftOnly" },
        { name: "mouseCtrlDown", type: "mouse", down: true, condition: "ctrlOnly" },
        { name: "mouseCtrlUp", type: "mouse", down: false, condition: "ctrlOnly" },
    ]
        
    constructor() {
        for (let action of this.actions) this[action.name] = {};
        this.mods = {};
        this.setMods({}); // Lazy hack
        $(document).keydown((ev) => {
            this.setMods(ev);
            for (let action of this.actions) {
                if (action.type == "key" && action.down && this.mods[action.condition] && this[action.name][ev.which]) {
                    this[action.name][ev.which]();
                }
            }
        });
        $(document).keyup((ev) => {
            this.setMods(ev);
            for (let action of this.actions) {
                if (action.type == "key" && !action.down && this.mods[action.condition] && this[action.name][ev.which]) {
                    this[action.name][ev.which]();
                }
            }
        });
    }
    bindKey(e, key, actions) {
        e.innerHTML = key;
        for (let action of this.actions) {
            if (action.type == "key") this[action.name][keycodes[key]] = actions[action.name];
        }

        e.onmousedown = () => {
            for (let action of this.actions) {
                if (action.type == "mouse" && action.down && this.mods[action.condition] && actions[action.name]) {
                    actions[action.name]();
                }
            }

            const onRelease = () => {
                for (let action of this.actions) {
                    if (action.type == "mouse" && !action.down && this.mods[action.condition] && actions[action.name]) {
                        actions[action.name]();
                    }
                }
                $(document).off("mouseup", onRelease);
            };
            $(document).on("mouseup", onRelease);
        };
    }
    setMods(ev) {
        const mods = {shift: ev.shiftKey, meta: ev.metaKey, ctrl: ev.ctrlKey, alt: ev.altKey};
        if(this.mods.shift != ev.shiftKey && this.onShift) this.onShift(ev.shiftKey);
        if(this.mods.ctrl != ev.ctrlKey && this.onCtrl) this.onCtrl(ev.ctrlKey);
        if(this.mods.alt != ev.altKey && this.onAlt) this.onAlt(ev.altKey);
        if(this.mods.meta != ev.metaKey && this.onMeta) this.onMeta(ev.metaKey);
        mods.none = !mods.shift && !mods.meta && !mods.ctrl && !mods.alt;
        mods.shiftOnly = mods.shift && !mods.meta && !mods.ctrl && !mods.alt;
        mods.metaOnly  = !mods.shift && mods.meta && !mods.ctrl && !mods.alt;
        mods.ctrlOnly  = !mods.shift && !mods.meta && mods.ctrl && !mods.alt;
        mods.altOnly   = !mods.shift && !mods.meta && !mods.ctrl && mods.alt;
        return this.mods = mods;
    }
}
