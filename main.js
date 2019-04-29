var canvas;
var ctx;
class color
{
    constructor(context)
    {
        if(context.r!=null && context.g!=null && context.b!=null)
        {
            this.r = context.r;
            this.g = context.g;
            this.b = context.b;
        }
        else if(context.hex!=null)
        {
            this.hex=context.hex;
        }
    }

    getColor()
    {
        if(this.hex!=null)
        {
            return this.hex;
        }
        else{
            var r=this.r.toString(16);
            var g=this.g.toString(16);
            var b=this.b.toString(16);

            return "#"+r+g+b;
        }
    }
}

class Vector2
{
    constructor(context)
    {
        if(context.x != null && context.y != null)
        {
            this.x = context.x;
            this.y = context.y;
        }
        else if(context.position != null)
        {
            this.x = context.position.x;
            this.y = context.position.y;
        }
        else if(context instanceof Vector2)
        {
            this.x = context.x;
            this.y = context.y;
        }
        else{
            this.x = 0;
            this.y = 0;
        }
    }
    
    setVector2(context)
    {
        if(context.x != null && context.y != null)
        {
            this.x = context.x;
            this.y = context.y;
        }
        else if(context.position != null)
        {
            this.x = context.position.x;
            this.y = context.position.y;
        }
    }

    static distance(v1,v2)
    {
        var x=v1.x-v2.x;
        var y=v1.y-v2.y;
        return Math.sqrt(x*x + y*y);
    }

    static Subtract(v1,v2)
    {
        return new Vector2({
            x:v1.x-v2.x,
            y:v1.y-v2.y
        });
    }

    static Cross(v1,v2)
    {
        return v1.x * v2.y - v1.y *v2.x;
    }
}

class WorldObject
{
    constructor(context)
    {
        if(context.position!=null)
        {
            this.position = new Vector2(context.position);
        }

        if(context.color !=null)
        {
            this.color = context.color;
        }
        else{
            this.color = '#' + (function co(lor){   
                return (lor += [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)]) && (lor.length == 6) ?  lor : co(lor); })('');
        }

        if(context.rotation!=null)
        {
            this.rotation = context.rotation;
        }
        else{
            this.rotation = 0;
        }
    }
}


class RayCasterSource extends WorldObject
{
    //PARAMS: position,color,rayColor,rayLength,rotation,followMouse
    constructor(context)
    {
        super(context);

        if(context.rayColor !=null)
        {
            this.rayColor = context.rayColor;
        }
        else{
            this.rayColor = '#' + (function co(lor){   
                return (lor += [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)]) && (lor.length == 6) ?  lor : co(lor); })('');
        }

        if(context.followMouse!=null && context.followMouse==false)
        {
            if(context.rayLength!=null)
            {
                this.rayLength = context.rayLength;
            }
            else{
                this.rayLength=10;
            }
        }
        this.intersection=null;
    }

    draw()
        {
            ctx.fillStyle=this.color;
            ctx.beginPath();
            ctx.ellipse(this.position.x,this.position.y,10,10,0,0,2*Math.PI,false);
            ctx.fill();

            ctx.strokeStyle=this.rayColor;
            ctx.lineWidth=2;
            ctx.beginPath();
            ctx.moveTo(this.position.x,this.position.y);
            if(this.intersection!=null)
            {
                ctx.lineTo(this.intersection.x,this.intersection.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle="#00ff00";
                ctx.ellipse(this.intersection.x,this.intersection.y,2,2,0,0,2*Math.PI,false);
                ctx.fill();
            }
            else{
                ctx.lineTo(mousePos.x,mousePos.y);
                ctx.stroke();
            }
            

        }
}

class walls extends WorldObject
{
    constructor(context)
    {
        super(context);
        if(context.width !=null)
        {
            this.width = context.width;
        }
        else{
            this.width = 50;
        }

        if(context.height !=null)
        {
            this.height = context.height;
        }
        else{
            this.height = 50;
        }
    }

    getBoundingRect()
    {
        var r = Math.sqrt((this.width*this.width)/4 + (this.height*this.height)/4);
        var angle = Math.atan2(this.height,this.width)*180/Math.PI;
        var angles=[angle,180-angle,180+angle,360-angle];
        var points = [];
        for(var i=0;i<angles.length;i++)
        {
            points.push(new Vector2({
                x:this.position.x + r*Math.cos((this.rotation+angles[i])*Math.PI/180),
                y:this.position.y + r*Math.sin((this.rotation+angles[i])*Math.PI/180)
            }));
        }
        return points;
    }

    draw()
    {
        this. points = this.getBoundingRect();
        ctx.fillStyle=this.color;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x,this.points[0].y);
        ctx.lineTo(this.points[1].x,this.points[1].y);
        for(var i=1;(i+1)%this.points.length!=1;i=(i+1)%this.points.length)
        {
            ctx.lineTo(this.points[i].x,this.points[i].y);
        }
        ctx.fill();
        ctx.fillStyle='#ff0000';
        ctx.beginPath();
        ctx.ellipse(this.position.x,this.position.y,2,2,0,0,2*Math.PI,false);
        ctx.fill();
        ctx.fillStyle='#0000ff';
        for (let index = 0; index < this.points.length; index++) {
            ctx.beginPath();
            ctx.ellipse(this.points[index].x,this.points[index].y,2,2,0,0,2*Math.PI,false);    
            ctx.fill();
        }
        
    }


}

RayCasterSource.prototype.lineIntersection=function(c,d)
{

    var r = Vector2.Subtract(mousePos,this.position);
    var s = Vector2.Subtract(d,c);
    var rs_cross = Vector2.Cross(r,s);
    var num1 = Vector2.Cross(Vector2.Subtract(c,this.position),s);
    var num2 = Vector2.Cross(Vector2.Subtract(this.position,c),r);
    var t =num1/rs_cross;
    var u =-num2/rs_cross; 

    if(t>=0&&t<=1 && u>=0 && u<=1)
    {
        var t = new Vector2({
            x: this.position.x + t*r.x,
            y: this.position.y + t*r.y
        });
        
        if(this.intersection != null)
        {
            var d_new = Vector2.distance(t,this.position);
            var d_prev = Vector2.distance(this.intersection,this.position);
            if(d_new<d_prev)
            {
                this.intersection = t;
            }
            
        }
        else{
            this.intersection = t; 
        }
    }
}

var getIntersections = function(source)
{
    source.intersection=null;
    for(var j=0;j<w.length;j++)
    {
        source.lineIntersection(w[j].points[0],w[j].points[1]);
        for (var i = 1; i%w[j].points.length !=0; i=(i+1)%w[j].points.length) {
            source.lineIntersection(w[j].points[i],w[j].points[(i+1)%w[j].points.length]);    
        }
    }   
}


function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}





function loop()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (var index = 0; index <w.length ; index++) {
        w[index].draw();
    }

    getIntersections(source1);
    getIntersections(source2);
    
    source1.draw();
    source2.draw();
}


var mousePos = new Vector2({x:0,y:0});
var source1 = new RayCasterSource({
    position:new Vector2({x:400,y:200}),
    color:'#00ff00',
    rayColor:'#ffff00',
    followMouse:true
});

var source2 = new RayCasterSource({
    position:new Vector2({x:200,y:300}),
    color:'#00ff00',
    rayColor:'#ff00ff',
    followMouse:true
});

var w=[];
function generateWalls()
{
    w=[];
    for (var index = 0; index < parseInt($('#walls').val()); index++) {
        w.push(new walls({
            position:new Vector2({x:Math.floor(Math.random()*800),y:Math.floor(Math.random()*400)}),
            rotation:Math.floor(Math.random()*360),
            color:'#232323',
            width:50,
            height:20
        }));
    }
}


$('document').ready(function(){
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    generateWalls()
    $('#myCanvas').on('mousemove',function(evt){
        mousePos.setVector2(getMousePos(canvas,evt));
    });

    setInterval(loop,1000/60);
});