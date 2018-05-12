const SVGNS = "http://www.w3.org/2000/svg";

// Create a control on the given SVG element for the given animate element.
function CreateAnimCtrl(svgSel, animSel, x, y) {
    const svgElem = document.querySelector(svgSel);
    const animElem = document.querySelector(animSel);
    const width = 100;
    const height = 100;

    let keySplines = getKeySplines(animElem);
    let selectedElement = 0;
    
    const boxElem = document.createElementNS(SVGNS, 'rect');
    boxElem.setAttribute('x', x);
    boxElem.setAttribute('y', y);
    boxElem.setAttribute('width', width);
    boxElem.setAttribute('height', height);
    boxElem.setAttribute('fill', 'none');
    boxElem.setAttribute('stroke', '#333');
    boxElem.setAttribute('stroke-width', '2');
    svgElem.appendChild(boxElem);
    
    const easingCurve = document.createElementNS(SVGNS, 'path');
    easingCurve.setAttribute('fill', 'none');
    easingCurve.setAttribute('stroke', '#00A');
    easingCurve.setAttribute('stroke-width', 2);
    svgElem.appendChild(easingCurve);
    
    const line1 = document.createElementNS(SVGNS, 'line');
    line1.setAttribute('stroke', '#C33');
    line1.setAttribute('stroke-width', 2);
    svgElem.appendChild(line1);
    
    const p1 = document.createElementNS(SVGNS, 'circle');
    p1.setAttribute('class', 'draggable');
    p1.setAttribute('id', 'controlPoint1');
    p1.setAttribute('r', 5);
    p1.setAttribute('fill', '#C33');
    p1.addEventListener('mousedown', onSelectElement);
    svgElem.appendChild(p1);
    
    const line2 = document.createElementNS(SVGNS, 'line');
    line2.setAttribute('stroke', '#C33');
    line2.setAttribute('stroke-width', 2);
    svgElem.appendChild(line2);
    
    const p2 = document.createElementNS(SVGNS, 'circle');
    p2.setAttribute('class', 'draggable');
    p2.setAttribute('id', 'controlPoint2');
    p2.setAttribute('r', 5);
    p2.setAttribute('fill', '#C33');
    p2.addEventListener('mousedown', onSelectElement);
    svgElem.appendChild(p2);

    function getKeySplines(animElem) {
        return animElem.getAttribute('keySplines')
            .split(';')
            .filter(s => s)
            .map(s => {
                let k = s.split(' ')
                    .map(s => +s);
                return {
                    "x1": k[0],
                    "y1": k[1],
                    "x2": k[2],
                    "y2": k[3],
                };
            });
    }
    
    this.update = function() {
        keySplines = getKeySplines(animElem);

        let pathStr = `
            M ${x},${height+y}
            C ${x + (width * keySplines[0].x1)},${y + (height * keySplines[0].y1)} ${x + (width * keySplines[0].x2)},${y + (height * keySplines[0].y2)} ${x + width},${y}`;
        easingCurve.setAttribute('d', pathStr);
        
        p1.setAttribute('cx', x + (width * keySplines[0].x1));
        p1.setAttribute('cy', y + (height * keySplines[0].y1));
        line1.setAttribute('x1', x);
        line1.setAttribute('y1', height + y);
        line1.setAttribute('x2', x + (width * keySplines[0].x1));
        line1.setAttribute('y2', y + (height * keySplines[0].y1));
        p2.setAttribute('cx', x + (width * keySplines[0].x2));
        p2.setAttribute('cy', y + (height * keySplines[0].y2));
        line2.setAttribute('x1', x + width);
        line2.setAttribute('y1', y);
        line2.setAttribute('x2', x + (width * keySplines[0].x2));
        line2.setAttribute('y2', y + (height * keySplines[0].y2));
    };

    function onSelectElement(evt) {
        evt.preventDefault();
        selectedElement = evt.currentTarget;
        selectedElement.setAttribute('r', 15);
        selectedElement.addEventListener('mousemove', onMoveElement);
        selectedElement.addEventListener('mouseout', onDeselectElement);
        selectedElement.addEventListener('mouseup', onDeselectElement);
    }
    
    function onMoveElement(evt){
        evt.preventDefault();
        // Append to the elements transform list
        const tfm = svgElem.createSVGTransform();
        tfm.setTranslate(evt.movementX, evt.movementY);
        selectedElement.transform.baseVal.appendItem(tfm);
    }
    
    function onDeselectElement(evt){
        evt.preventDefault();
        
        // Consolidate the transform list
        selectedElement.transform.baseVal.consolidate();
        
        let ks = animElem.getAttribute('keySplines')
            .split(';')
            .filter(s => s)
            .map(s => s.split(' ').map(s => +s));

        let ax = (evt.clientX - x) / width;
        let ay = (evt.clientY - y) / height;
        if (selectedElement.getAttribute('id') === 'controlPoint1') {
            ks[0][0] = ax > 1 ? 1 : ax < 0 ? 0 : ax;
            ks[0][1] = ay > 1 ? 1 : ay < 0 ? 0 : ay;
        }
        if (selectedElement.getAttribute('id') === 'controlPoint2') {
            ks[0][2] = ax > 1 ? 1 : ax < 0 ? 0 : ax;
            ks[0][3] = ay > 1 ? 1 : ay < 0 ? 0 : ay;
        }
        animElem.setAttribute('keySplines',
            `${ks[0][0]} ${ks[0][1]} ${ks[0][2]} ${ks[0][3]};`);

        selectedElement.setAttribute('r', 5);
        
        // Clear selected
        selectedElement.transform.baseVal.clear();
        selectedElement.removeEventListener('mousemove', onMoveElement);
        selectedElement.removeEventListener('mouseout', onDeselectElement);
        selectedElement.removeEventListener('mouseup', onDeselectElement);
        selectedElement = 0;
    }
}
let slideCtrl = new CreateAnimCtrl('#mySVG', '#slideRight', 10, 100);

function update() {
    slideCtrl.update();
}
setInterval(update, 10);
