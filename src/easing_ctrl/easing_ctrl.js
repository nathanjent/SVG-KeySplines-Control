const SVGNS = "http://www.w3.org/2000/svg";

// Create a control on the given SVG element for the given animate element.
export function AnimCtrl(svgSel, animSel, x, y) {
    const svgElem = document.querySelector(svgSel);
    const animElem = svgElem.querySelector(animSel);
    const width = 100;
    const height = 100;

    let keySplines = getKeySplines(animElem);

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

        const textElem = document.createElementNS(SVGNS, 'text');
        textElem.setAttribute('id', `text${i}`);
        textElem.setAttribute('x', x + (width * i));
        textElem.setAttribute('y', y + height + 20);
        textElem.setAttribute('style', 'font-size:.6em;');
        svgElem.appendChild(textElem);

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

        const line2 = document.createElementNS(SVGNS, 'line');
        line2.setAttribute('id', `handleB${i}`);
        line2.setAttribute('stroke', '#C33');
        line2.setAttribute('stroke-width', 2);
        svgElem.appendChild(line2);
    }

    for (let i = 0; i < keySplines.length; i++) {
        const p1 = document.createElementNS(SVGNS, 'circle');
        p1.setAttribute('id', `controlPointA${i}`);
        p1.setAttribute('class', 'draggable');
        p1.setAttribute('r', 5);
        p1.setAttribute('fill', '#C33');
        p1.addEventListener('mousedown', onSelectElement);
        svgElem.appendChild(p1);

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
                    x1: k[0],
                    y1: k[1],
                    x2: k[2],
                    y2: k[3],
                };
            });
    }

    this.update = function() {
        keySplines = getKeySplines(animElem);

        for (let i = 0; i < keySplines.length; i++) {
            let ks = keySplines[i];
            let p1 = svgElem.querySelector(`#controlPointA${i}`);
            let line1 = svgElem.querySelector(`#handleA${i}`);
            let p2 = svgElem.querySelector(`#controlPointB${i}`);
            let line2 = svgElem.querySelector(`#handleB${i}`);
            let easingCurve = svgElem.querySelector(`#curve${i}`);
            let text = svgElem.querySelector(`#text${i}`);

            let pathStr = `
                M ${x + (width * i)},${height + y}
                C ${x + (width * ks.x1) + (width * i)},${y + (height * ks.y1)}
                    ${x + (width * ks.x2) + (width * i)},${y + (height * ks.y2)}
                    ${x + width + (width * i)},${y}`;
            easingCurve.setAttribute('d', pathStr);
            text.textContent = `${ks.x1} ${ks.y1} ${ks.x2} ${ks.y2};`;
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
        let selectedElement = evt.currentTarget;
        // Disable dragging
        selectedElement.ondragstart = function() {
            return false;
        };
        selectedElement.setAttribute('r', 15);
        appendMovement(evt.movementX, evt.movementY);
        document.addEventListener('mousemove', onMoveElement);
        selectedElement.addEventListener('mouseup', onDeselectElement);

        function onMoveElement(evt) {
            appendMovement(evt.movementX, evt.movementY);
        }

        // Append to the selected elements transform list
        function appendMovement(dx, dy) {
            const tfm = svgElem.createSVGTransform();
            tfm.setTranslate(dx, dy);
            selectedElement.transform.baseVal.appendItem(tfm);
        }

        function onDeselectElement(evt) {
            // Consolidate the transform list
            selectedElement.transform.baseVal.consolidate();

            // Get key splines
            let keySplines = getKeySplines(animElem);

            // Update key splines for moved control point
            let keySplineStr = '';
            for (let i = 0; i < keySplines.length; i++) {
                let controlPointA = document.querySelector(`#controlPointA${i}`);
                let controlPointB = document.querySelector(`#controlPointB${i}`);
                let keySpline = keySplines[i];

                let ax = (evt.clientX - x - (width * i)) / width;
                let ay = (evt.clientY - y) / height;

                if (selectedElement === controlPointA) {
                    keySpline.x1 > 1 ? 1 : ax < 0 ? 0 : ax;
                    keySpline.y1 = ay > 1 ? 1 : ay < 0 ? 0 : ay;
                }
                if (selectedElement === controlPointB) {
                    keySpline.x2 = ax > 1 ? 1 : ax < 0 ? 0 : ax;
                    keySpline.y2 = ay > 1 ? 1 : ay < 0 ? 0 : ay;
                }
                keySplineStr += `${keySpline.x1} ${keySpline.y1} ${keySpline.x2} ${keySpline.y2};`;
            }
            animElem.setAttribute('keySplines', keySplineStr);

            selectedElement.setAttribute('r', 5);

            // Clear selected
            selectedElement.transform.baseVal.clear();
            document.removeEventListener('mousemove', onMoveElement);
            selectedElement.removeEventListener('mouseup', onDeselectElement);
        }
    }


    let me = this;
    this.start = function() {
        setInterval(() => me.update(), 10);
    }
}
