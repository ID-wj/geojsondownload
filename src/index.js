const fs = require("fs");
const https = require("https");
const amapKey = ""; //用户在高德地图官网申请Web服务API类型KEY
const url = `https://restapi.amap.com/v3/config/district?key=${amapKey}&extensions=all&keywords=`;
// 广东省各市
// const districtsList = ["440000", "440500", "440600", "441200", "441300", "440300", "440800", "440400", "445100", "440900", "440700", "441600", "445300", "441500", "441700", "445200", "441400", "440100", "440200", "441800", "442000", "441900"];
// 中国地图
const districtsList = ["100000"];
const path = require("path");

districtsList.forEach(d => {
    https.get(url + d, res => {
        let body = [];
        res.on("data", chunk => {
            body.push(chunk);
        });
        res.on("end", () => {
            body = Buffer.concat(body);
            body = body.toString();
            body = JSON.parse(body);
            const { districts } = body;
            let [{ polyline, name, adcode, center, level }] = districts;
            const coordinates = polyline
                    .split("|")
                    .map(v =>
                        v.split(";")
                        .map(j =>
                            j.split(",").map(k => Number(k))
                        ));
            const file = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "name": name,
                            "center": center.split(",").map(v => Number(v)),
                            "adcode": adcode,
                            "level": level
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": coordinates
                        }
                    }
                ]
            };
            fs.writeFile(path.resolve(__dirname, "../result/" + adcode + ".json"), JSON.stringify(file), "utf8", () => {
                console.log(`${adcode}.json(${name})已保存`);
            });
        });
    });
});
