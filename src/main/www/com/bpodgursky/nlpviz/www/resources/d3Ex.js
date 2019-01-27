// const d3 = require('d3');
const D3Node = require('d3-node');
const fs = require('fs');
const { convert } = require('convert-svg-to-png');


// const jsdom = require("jsdom");
// var fs = require('fs');
// const {
//     JSDOM
// } = jsdom;


process.argv.forEach(function (val, index, array) {
    // console.log(index + ': ' + val);
    console.log(index);
    console.log(val);

    if (index == 2) {
        readJson(val,array[index+1]);
    }
});


function readJson(filename,text) {
    // var treeData;
    const treeData = JSON.parse(fs.readFileSync('./batch/en/'+filename+".json", 'utf8'));
    tree_d3(treeData[0],filename,text);
    // fs.readFile('./batch/en/' + filename + '.json', 'utf8', function (err, data) {
    //     if (err) throw err;
    //     treeData = JSON.parse(data);
    //     tree_d3(treeData[0], filename);
    // });
    fs.unlinkSync('./batch/en/' + filename + '.json');
}


function tree_d3(treeData, filename,text) {


    // var treeData;
    // fs.readFile('.\\batch\\en\\'+filename+'.json', 'utf8', function (err, data) {
    //     if (err) throw err;
    //     treeData = JSON.parse(data);
    // });

    // const treeData = JSON.parse(fs.readFileSync('.\\batch\\en\\'+filename+".json", 'utf8'));
    // console.log(treeData);

    let d3n = new D3Node();

    // const dom = new JSDOM(`<!DOCTYPE html><body><div id="list"></div></body>`);

    // let document = dom.window.document;
    let width = 1000,
        height = 1000
        hRoot = 0;



    let d3 = d3n.d3;

    let root = d3.hierarchy(treeData);

    var treeLayout = d3.tree().nodeSize([100,100]);

    // treeLayout.size([2500, 1500]);
    let nodes = treeLayout(root);

    let svg = d3n.createSVG();
    svg.style('background-color',"#fff");


    // svg.attr("width", width)
    //     .attr("height", height),
    let gText = svg.append("g");
    let g = svg.append("g");
        // .attr("transform", "translate(100,50)");
    g.append("g").attr('class', 'links');
    g.append("g").attr('class', 'nodes');

    // Nodes
    var node = svg
        .select("g.nodes")
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + (d.y * 2) + "," + d.x + ")";
        }).attr("y",function(d){
            d.y = d.parent?d.y * 2:d.y;
            hRoot = hRoot >d.x?d.x:hRoot;
            width = width < d.y? d.y:width;
            height = height < d.x? d.x:height;
            return d.parent?d.y * 2:d.y;
        })

    width = width + 150;
    height = height - hRoot + 250;

    treeLayout.size([width,height]);
    svg.attr("width",width);
    svg.attr("height",height);
    g.attr("transform","translate("+65+","+(-hRoot + 200)+")");


    gText.append("rect")
        .attr("width",width - 50)
        .attr("height",100)
        .attr("x",20)
        .attr("y",30)
        .attr("rx",5)
        .attr('ry',5)
        .style('fill','#fff')
        .style('stroke',"#555");

    gText.append('foreignObject')
        .attr('width',width - 100)
        .attr('height',80)
        .attr('y',40)
        .attr('x',50)
        .style('text-anchor','start')
        .attr('font-size','170%')
        .style("font-weight","bold")
        .style("font-family","monospace")
        .append('xhtml:body')
        .html(text);

    

    // node.append("circle")
    //     .attr("r", 8)
    //     .attr("fill", "#333");

    let rect = node.append("rect")
        .attr("x",function(d){return d.data.data.word?-75:-55})
        .attr("y",-20)
        .attr("rx",5)
        .attr("ry",5)
        .attr("width",function(d){return d.data.data.word?150:110})
        .attr("height",40)
        .style("fill","#fff")
        .style("stroke","#3e3e3e")
        .style("stroke-width","3px")
        .style("stroke-linejoin","round")
        .style("fill",function(d){return d.data.data.word?"rgb(200,158,212)":"#fff"})


    node.append("text")
        .attr("dy", 8)
        .style("font-family","monospace")
        .style("font-weight","bold")
        .attr("x", function (d) {
            return d.children ? 0 : 0;
        })
        .style("text-anchor", function (d) {
            return d.children ? "middle" : "middle";
        })
        .attr("font-size", "150%")
        .text(function (d) {
            if(d.data.data.word)
                return d.data.data.word
            return d.data.data.type;
        });

    // node.append("text")
    //     .attr("dy", 3)
    //     .attr("x", function (d) {
    //         return d.children ? -12 : 12;
    //     })
    //     .style("text-anchor", function (d) {
    //         return d.children ? "end" : "start";
    //     })
    //     .attr("font-size", "150%")
    //     .text(function (d) {
    //         return d.data.data.type;
    //     });



    // Links
    svg.select('g.links')
        .selectAll('path.link')
        .data(root.descendants().slice(1))
        .enter()
        .append('path')
        .classed('link', true)
        .style('stroke-width', '4px')
        .style('fill', 'none')
        .style('stroke', '#333')
        .attr("d", function (d) {
            return "M" + (d.y + 0) + "," + d.x +
                "C" + (d.parent.y + d.y)/2 + "," + (d.x + 0) +
                " " + (d.parent.y + d.y)/2 + "," + (d.parent.x + 0) +
                " " + (d.parent.y + 0) + "," + d.parent.x;
        });
    const options = {
        width: Math.floor(width),
        height: Math.floor(height)
    };
    

    let dir = "./batch/img/"+filename.substr(0, filename.indexOf('-'));
    // let dir = '.\\batch\\img\\oooo';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const png = convert(d3n.svgString()).then(function (result) {
        fs.writeFile(dir + '/'+filename+'.png',result,"base64",function(err){
            console.log(err);
            return ;
        })
    });
    
    // output files to /dist dir
    // output(dir + '/' + filename, d3n, options, function () {
    //     console.log("is Saved");
    // });


}