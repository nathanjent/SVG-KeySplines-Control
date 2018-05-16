const SVGNS = "http://www.w3.org/2000/svg";

// Create a control on the given SVG element for the given animate element.
function CreateAnimCtrl(svgSel, animSel, x, y) {
    const svgElem = document.querySelector(svgSel);
    const animElem = document.querySelector(animSel);
    const width = 100;
    const height = 100;

    let keySplines = getKeySplines(animElem);
    let selectedElement = 0;
    
    for (let i = 0; i < keySplines.length; i++) {
        const boxElem = document.createElementNS(SVGNS, 'rect');
        boxElem.setAttribute('id', `box${i}`);
        boxElem.setAttribute('x', x + (width * i));
        boxElem.setAttribute('y', y);
        boxElem.setAttribute('width', width);
        boxElem.setAttribute('height', height);
        boxElem.setAttribute('fill', 'none');
        boxElem.setAttribute('stroke', '#333');
        boxElem.setAttribute('stroke-width', '2');
        svgElem.appendChild(boxElem);
        
        const easingCurve = document.createElementNS(SVGNS, 'path');
        easingCurve.setAttribute('id', `curve${i}`);
        easingCurve.setAttribute('fill', 'none');
        easingCurve.setAttribute('stroke', '#00A');
        easingCurve.setAttribute('stroke-width', 2);
        svgElem.appendChild(easingCurve);
        
        const line1 = document.createElementNS(SVGNS, 'line');
        line1.setAttribute('id', `handleA${i}`);
        line1.setAttribute('stroke', '#C33');
        line1.setAttribute('stroke-width', 2);
        svgElem.appendChild(line1);
        
        const p1 = document.createElementNS(SVGNS, 'circle');
        p1.setAttribute('id', `controlPointA${i}`);
        p1.setAttribute('class', 'draggable');
        p1.setAttribute('r', 5);
        p1.setAttribute('fill', '#C33');
        p1.addEventListener('mousedown', onSelectElement);
        svgElem.appendChild(p1);
        
        const line2 = document.createElementNS(SVGNS, 'line');
        line2.setAttribute('id', `handleB${i}`);
        line2.setAttribute('stroke', '#C33');
        line2.setAttribute('stroke-width', 2);
        svgElem.appendChild(line2);
        
        const p2 = document.createElementNS(SVGNS, 'circle');
        p2.setAttribute('id', `controlPointB${i}`);
        p2.setAttribute('class', 'draggable');
        p2.setAttribute('r', 5);
        p2.setAttribute('fill', '#C33');
        p2.addEventListener('mousedown', onSelectElement);
        svgElem.appendChild(p2);
    }

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

        for (let i = 0; i < keySplines.length; i++) {
            let ks = keySplines[i];
            let p1 = document.querySelector(`#controlPointA${i}`);
            let line1 = document.querySelector(`#handleA${i}`);
            let p2 = document.querySelector(`#controlPointB${i}`);
            let line2 = document.querySelector(`#handleB${i}`);
            let easingCurve = document.querySelector(`#curve${i}`);

            let pathStr = `
                M ${x + (width * i)},${height + y}
                C ${x + (width * ks.x1) + (width * i)},${y + (height * ks.y1)}
                    ${x + (width * ks.x2) + (width * i)},${y + (height * ks.y2)}
                    ${x + width + (width * i)},${y}`;
            easingCurve.setAttribute('d', pathStr);
            p1.setAttribute('cx', x + (width * ks.x1) + (width * i));
            p1.setAttribute('cy', y + (height * ks.y1));
            line1.setAttribute('x1', x + (width * i));
            line1.setAttribute('y1', height + y);
            line1.setAttribute('x2', x + (width * ks.x1) + (width * i));
            line1.setAttribute('y2', y + (height * ks.y1));
            p2.setAttribute('cx', x + (width * ks.x2) + (width * i));
            p2.setAttribute('cy', y + (height * ks.y2));
            line2.setAttribute('x1', x + width + (width * i));
            line2.setAttribute('y1', y);
            line2.setAttribute('x2', x + (width * ks.x2) + (width * i));
            line2.setAttribute('y2', y + (height * ks.y2));
        }
    };

    function onSelectElement(evt) {
        evt.preventDefault();
        selectedElement = evt.currentTarget;
        selectedElement.setAttribute('r', 15);
        selectedElement.addEventListener('mousemove', onMoveElement);
        selectedElement.addEventListener('mouseout', onDeselectElement);
        selectedElement.addEventListener('mouseup', onDeselectElement);
    }
    
    function onMoveElement(evt) {
        evt.preventDefault();
        // Append to the elements transform list
        const tfm = svgElem.createSVGTransform();
        tfm.setTranslate(evt.movementX, evt.movementY);
        selectedElement.transform.baseVal.appendItem(tfm);
    }
    
    function onDeselectElement(evt) {
        evt.preventDefault();
        
        // Consolidate the transform list
        selectedElement.transform.baseVal.consolidate();
        
        // Get key splines
        let keySplines = animElem.getAttribute('keySplines')
            .split(';')
            .filter(s => s)
            .map(s => s.split(' ').map(s => +s));

        // Update key splines for moved control point
        let keySplineStr = '';
        for (let i = 0; i < keySplines.length; i++) {
            let controlPointA = document.querySelector(`#controlPointA${i}`);
            let controlPointB = document.querySelector(`#controlPointB${i}`);
            let keySpline = keySplines[i];

            let ax = (evt.clientX - x - (width * i)) / width;
            let ay = (evt.clientY - y) / height;

            if (selectedElement === controlPointA) {
                keySpline[0] = ax > 1 ? 1 : ax < 0 ? 0 : ax;
                keySpline[1] = ay > 1 ? 1 : ay < 0 ? 0 : ay;
            }
            if (selectedElement === controlPointB) {
                keySpline[2] = ax > 1 ? 1 : ax < 0 ? 0 : ax;
                keySpline[3] = ay > 1 ? 1 : ay < 0 ? 0 : ay;
            }
            keySplineStr += `${keySpline[0]} ${keySpline[1]} ${keySpline[2]} ${keySpline[3]};`;
        }
        animElem.setAttribute('keySplines', keySplineStr);

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