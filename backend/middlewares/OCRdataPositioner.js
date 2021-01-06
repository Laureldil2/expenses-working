var moment = require('moment')

class OCRdataPositioner {

    process = (OCRdata) => {
        this.metadata = {}
        this.#preprocess(OCRdata)
        this.data = [];
        this.preparedLongData.forEach(word => this.#assignWordToRow(word))
        this.preparedShortData.forEach(word => this.#assignWordToRow(word))
        this.#sortRows();
        this.#sortWords();
        return this.#postprocess();
    }

    #preprocess = (OCRdata) => {
        this.preparedLongData = [];
        this.preparedShortData = [];
        for (let i = 1; i < OCRdata.length; i++) {
            let word = {};
            word.description = OCRdata[i].description;
            word.rangeY = (OCRdata[i].boundingPoly.vertices[3].y - OCRdata[i].boundingPoly.vertices[0].y) / 2;
            word.midY = OCRdata[i].boundingPoly.vertices[0].y + word.rangeY;
            word.midX = (OCRdata[i].boundingPoly.vertices[1].x - OCRdata[i].boundingPoly.vertices[0].x) / 2 + OCRdata[i].boundingPoly.vertices[0].x;
            if (word.description.length !== 1) {
                word.description = word.description.replace(/[0-9](szt$|kg$)/gi, word => {
                    return word.substr(0, 1)
                })
                word.description = word.description.replace(/x[0-9]/gi, word => {
                    return word.substr(1, word.length)
                })
                this.preparedLongData.push(word);
            } else if ((word.description.match(/[.,x*ABCDEFO+itHw]/gi) || []).length === 0)
                this.preparedShortData.push(word);
        }
    }

    #assignWordToRow = (word) => {
        for (let i = 0; i < this.data.length; i++) {
            if (word.midY > this.data[i].start && word.midY < this.data[i].end) {
                this.data[i].words.push(word);
                let mid = 0;
                let range = 0;
                for (let j = 0; j < this.data[i].words.length; j++) {
                    mid += this.data[i].words[j].midY;
                    range += this.data[i].words[j].rangeY;
                }
                mid = mid / this.data[i].words.length;
                range = range / this.data[i].words.length;
                this.data[i].center = mid
                this.data[i].start = mid - range;
                this.data[i].end = mid + range;
                return;
            }
        }
        let row = {}
        row.start = word.midY - word.rangeY;
        row.end = word.midY + word.rangeY;
        row.center = word.midY;
        row.words = [];
        row.words.push(word);
        this.data.push(row)
    }

    #sortWords = () => {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i].words.sort((a, b) => {
                if (a.midX < b.midX) {
                    return -1;
                }
                if (a.midX > b.midX) {
                    return 1;
                }
                return 0;
            })
        }
    }

    #sortRows = () => {
        this.data.sort((a, b) => {
            if (a.center < b.center) {
                return -1;
            }
            if (a.center > b.center) {
                return 1;
            }
            return 0;
        })
    }

    #postprocess = () => {
        let lineCounter = 0;
        //console.log("--DEBUG-SECTION--")
        this.productSection = false;
        this.metadata.isReceipt = false;
        let text = ""
        this.data.forEach((row, index) => {
            let line = "";
            row.words.forEach((word, index) => {
                line += word.description;
                if ((word.description.length === 1) && (word.description.match(/[.,]/gi) || []).length > 0) {
                    line = line.slice(0, -1);
                } else {
                    line += " "
                }
            })
            if (index === 0) {
                console.log(line);
                this.metadata.shop_name = line.trim();
            }
            if (line.search(/p *a *r *a *g *o *n *f *i *s *k *a *l *n *y/i) !== -1) {
                this.productSection = true;
                this.metadata.isReceipt = true;
                this.metadata.productSectionStart = lineCounter + 1;
            }
            if (line.search(/NIP/gi) !== -1) {
                this.metadata.NIP = line.match(/[0-9-]{10,13}/g)[0].replace(/-/gi, "");
            }
            if (line.search(/[0-9]{4}(-[0-9]{2}){2}/g) !== -1) {  //([0-9]{2,4}-){2}[0-9]{2,4} [0-9]{2}:[0-9]{2}
                this.metadata.date = moment.utc(line.match(/[0-9]{4}(-[0-9]{2}){2}/g)[0], "YYYY-MM-DD").format('YYYY-MM-DD');
            }

            if (line.search(/([0-9]{2}-){2}[0-9]{4}/g) !== -1) {
                this.metadata.date = moment.utc(line.match(/([0-9]{2}-){2}[0-9]{4}/g)[0], "DD-MM-YYYY").format('YYYY-MM-DD');
            }

            if (this.productSection && line.search(/sp[rzedaż]*[. ,]?op[odatkwn]*/i) !== -1) {
                this.productSection = false;
                this.metadata.productSectionEnd = lineCounter - 1;
            }
            if (this.productSection && (line.search(/(razem)|(podsum)/i) !== -1)) {
                return;
            }
            if (this.productSection && (line.match(/[a-z]/gi) || []).length < 5) {
                text = text.slice(0, -1);
                lineCounter--;
                //console.log(line + " " + (line.match(/[a-z]/gi) || []).length)
            }

            line = line.replace(/,/g, ".")

            if (line.search(/PLN *[0-9]*(,|.)[0-9]{2}/i) !== -1) {
                this.metadata.sum = line.match((/PLN *[0-9]*(,|.)[0-9]{2}/i))[0].replace(/PLN */i, "");
            }
            text += line + "\n";
            lineCounter++;
        })
        //console.log("-----------------")
        console.log("POSITIONED OCR")
        console.log(text)
        console.log("-----")
        return text;
    }


}

exports.OCRdataPositioner = OCRdataPositioner;