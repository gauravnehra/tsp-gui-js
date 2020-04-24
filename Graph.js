Graph = (function(){
    'use strict';

    var Graph = {

        Point: function(x,y){
            this.x = x;
            this.y = y;
        },

        randomInt:function(u){
            return Math.floor(Math.random() * (u + 1));
        },

        distance: function(pt1, pt2) {
            var xDelta = pt1.x - pt2.x;
            var yDelta = pt1.y - pt2.y;
            return Math.sqrt((xDelta * xDelta) + (yDelta * yDelta));
        },

        algorithms:{},

        extensions:[],

        register: function(algo) {
            for(var key in algo) {
                if(algo.hasOwnProperty(key) && key !== "name" && key !== "key") {
                    algo.key = key;
                    this.algorithms[key] = algo;
                    break;
                }
            }          
        },

        getAlgorithm: function(key) {
            var algo = this.algorithms[key];
            if(algo !== undefined)
                return algo[algo.key]; // return the constructor
        },

        extendAlgorithm: function (destination, srcKey, propertyKey) {
            this.extensions.push({
                destination: destination,
                srcKey: srcKey,
                propertyKey: propertyKey
            });
        },

        processExtensions: function () {
            var ext, i, algo;
            while (ext = this.extensions.pop()) {
                algo = this.getAlgorithm(ext.srcKey);
                if(algo !== undefined) {
                    ext.destination.prototype[ext.propertyKey] = algo.prototype[ext.propertyKey];
                }
            }
        }
    };

    var Solver =  function(notify) {
        this.notify = notify;
        this.points = [];
        this.solution = [];
        this.timeout = 0;
    };

    Solver.prototype.addPoint = function(x,y){
        this.points.push(new Graph.Point(x,y));
    };

    Solver.prototype.solve = function(algoKey) {

        if(this.timeout > 0 || this.points.length == 0) return;

        this.iteration = 0;
        this.improvements = 0;
        this.distance = Number.MAX_VALUE;
        Graph.processExtensions();

        var algo = Graph.getAlgorithm(algoKey),
            tsp = this;

        if(algo === undefined) {
            throw "Algorithm [" + algoKey + "] not found.";
        }
        else {
            this.algo = new algo(this);         
            this.timeout = setTimeout(function() { tsp.iterate(); }, 0);
        }
    };

    Solver.prototype.iterate = function() {

        var solution = this.algo.solve(),
            distance = this.pathDistance(solution),
            tsp = this;

        if(distance < this.distance) {
            this.distance = distance;
            this.solution = solution;
            this.improvements++;
        }
        this.iteration++;
        this.notify();
        if(!this.algo.done) {          
            this.timeout = setTimeout(function() { tsp.iterate(); }, 0);
        }
        else {
            this.timeout = 0;
        }
    };

    Solver.prototype.stop = function(){
        clearTimeout(this.timeout);
        this.timeout = 0;
    };

    Solver.prototype.clear = function(){
        this.stop();
        this.points = [];
        this.solution = [];
    };

    Solver.prototype.getPossible = function(){

        var result = [],
            pl = this.points.length,
            i = 0;

        for(; i < pl; i++) {
            result.push(i);
        }
        return result;
    };

    Solver.prototype.pathDistance = function(indexes){

        var pts = this.points,
            l = pts.length,
            distance = Graph.distance,
            d = distance(pts[indexes[0]], pts[indexes[l - 1]]),
            i = 1;

        for (; i < l; i++) {
            d += distance(pts[indexes[i]], pts[indexes[i - 1]]);
        }
        return d;
    };

    Graph.Solver = Solver;

    return Graph;

})();
