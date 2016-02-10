var QSBtn = function(params){
    this.icon = params.icon ;
    this.name = params.name ;
    
    this.click = params.click ;
    this.step_press = params.step_press ;										// action each second during mousedown
    this.longclick = params.longclick ;
    this.dblclick = params.dblclick ;
    
    this.btn = null ;															// the dom instance of this button
    
    this.pressing = null ;														// the interval function instance
    this.dbl_tapping = false ;
    this.mds_tm = null ;														// the mouse down start time
    
    var that = this ;
    
    this.set_btn_addon = function(){
        var li = document.createElement('li');									// creation of the button
        var btn = document.createElement('a');
        btn.id = 'quick-settings-'+this.name;
        btn.classList.add('icon');
        btn.classList.add('bb-button');
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-hidden', 'true');
        btn.href = '#';
        li.appendChild(btn);
        document.querySelector('#quick-settings ul').appendChild(li);

        if (typeof this.icon === "function") {									// if the creation of buton is a function
            this.icon(btn);
		}else{
            btn.setAttribute('data-icon', this.icon);							// else data-icon
        }
        this.btn = btn ;
        this.gest_click();
        console.log('button created');
    }
     
    this.gest_click = function(){
        this.btn.addEventListener('touchstart',function(){						// mousedown
            var ntime = new Date().getTime();
            if(ntime - that.mds_tm < 1000)										// if last touch start is less than 1 second old
                that.dbl_tapping = true ;
            if(that.step_press)													// step pressing
                that.pressing = setInterval(function(){that.step_press(that)},1000);
            that.mds_tm = ntime ;
        });
        this.btn.addEventListener('touchend',function(){						// mouseup
            clearInterval(that.pressing);
            var long = new Date().getTime() - that.mds_tm ;
            if(long > 500 && that.longclick){									// long click (more than 0.5 second)
                that.longclick(that);
            }else{
                if(that.dbl_tapping && that.dblclick)							// simple click
                    that.dblclick(that);
                else															// double click
                	that.click(that);
            }
            that.dbl_tapping = false ;
        });
    };
    
    if (document.readyState === 'complete') {									// to init the button
        console.log('document state is complete');
        that.set_btn_addon();
    } else {
        console.log('document is not ready');
        window.addEventListener('DOMContentLoaded',function(){that.set_btn_addon()});
    }
        
};



var req_url = 'http://192.168.1.82/txtcpy.php?num=' ;

/*		Copy and load text
	We need two short click to load and copy text, 
    because copy need to be in user event and not XHR event ... */
var short_click = function(){													// short click function
    console.log('start simple click function');
    var tarea = document.querySelector('#tarea-copy-addon');
    if(tarea==undefined){														// create a textarea if not exist
        tarea = document.createElement('textarea');
        tarea.id = 'tarea-copy-addon';
        tarea.style.width = '100%';
        document.querySelector('#utility-tray-notifications').appendChild(tarea);
		tarea.value = 'empty' ;
    }
    tarea.select();
    document.execCommand('copy');												// select and copy text
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function(){									// load and set text
        document.querySelector('#tarea-copy-addon')
        tarea.value = this.responseText;
    });
    oReq.open("GET", req_url);
    oReq.send();
    
	console.log('end of simple click function'); 	
};

var step_click = function(btn){													// long click function
    console.log('start step_click function');
    var tarea = document.querySelector('#tarea-copy-addon');
    if(tarea==undefined){
        tarea = document.createElement('textarea');
        tarea.id = 'tarea-copy-addon';
        tarea.style.width = '100%';
        document.querySelector('#utility-tray-notifications').appendChild(tarea);
		tarea.value = 'empty' ;
    }
    
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function(){
        document.querySelector('#tarea-copy-addon')
        tarea.value = this.responseText;
    });
    oReq.open("GET", req_url + Math.floor((new Date().getTime()-btn.mds_tm)/1000) );
    oReq.send();
    
    console.log('end of step_click function');
};

var dbl_click = function(btn){													// double click function
    console.log('start dbl_click function');									// show options
    if(document.querySelector('#addon-opt')==undefined){
        var opt = document.createElement('div');
        opt.id = "addon-opt" ;

        var closeBtn = document.createElement('button');						// creation of close button
        closeBtn.textContent = 'X';
        closeBtn.classList.add('close');
        closeBtn.onclick = function() {
            opt.parentNode.removeChild(opt);
        }
        opt.appendChild(closeBtn);

    	document.body.appendChild(opt);
        
        var title = document.createElement('div');								// set title
        closeBtn.classList.add('title');
        title.textContent = 'Options';
        opt.appendChild(title);
        
        var inp = document.createElement('input');								// add input
        inp.style.width = "100%";
        inp.style.height = '2em' ;
        inp.value = req_url ;
        inp.addEventListener('change',function(){req_url=inp.value});
        opt.appendChild(inp);
    }
    console.log('end dbl_click function');
};
// bouton creation
new QSBtn({icon:'email-reply', click:short_click, step_press:step_click, dblclick:dbl_click, name:"webcopy"});

console.log("syntax ok");