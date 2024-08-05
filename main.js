const stage = document.getElementById("stage");
const squareTemplate = document.getElementById("square-template");
const stoneStateList = [];

let currentColor = 1;
const currentTurnText = document.getElementById("current-turn");
const onClickSquare = (index) => {
    // ひっくり返せる石の数を取得
    const reversibleStones = getReversibleStones(index);
    // 他の石があるか、置いたときにひっくり返せる石がない場合は置けないメッセージを出す
    if (stoneStateList[index] !== 0 || !reversibleStones.length) {
        alert("ここには置けません！");
        return;
    }

    // 自分の石を置く
    stoneStateList[index] = currentColor;
    document.querySelector(`[data-index='${index}']`).setAttribute("data-state", currentColor);

    // 相手の石をひっくり返す = stoneStateList及びHTML要素の状態を現在のターンの色に変更する
    reversibleStones.forEach((key) => {
        stoneStateList[key] = currentColor;
        document.querySelector(`[data-index='${key}']`).setAttribute("data-state", currentColor);
    });

    // もし盤面がいっぱいだったら、集計してゲームを終了する
    if (stoneStateList.every((state) => state !== 0)) {
        const blackStonesNum = stoneStateList.filter(state => state === 1).length;
        const whiteStonesNum = stoneStateList.filter(state => state === 2).length;

        let winnerText = "";
        if (blackStonesNum > whiteStonesNum) {
            winnerText = "黒の勝ちです！"
        } else if (blackStonesNum < whiteStonesNum) {
            winnerText = "白の勝ちです！"
        } else {
            winnerText = "引き分けです!"
        }

        alert(`ゲーム終了です。白${whiteStonesNum}、黒${blackStonesNum}で、${winnerText}`);
    }

    // ゲーム続行なら相手のターンにする
    changeTurn();
}

const passButton = document.getElementById("pass");
const changeTurn = () => {
    currentColor = 3 - currentColor;

    if (currentColor === 1) {
        currentTurnText.textContent = "黒";
    } else {
        currentTurnText.textContent = "白";
    }
}

const getReversibleStones = (index) => {
    // クリックしたマスから見て、各方向にマスがいくつあるかをあらかじめ計算する
    const squareNums = [
        7 - (index % 8),
        Math.min(7 - (index % 8), (56 + (index % 8) - index) / 8),
        (56 + (index % 8) - index) / 8,
        Math.min(index % 8, (56 + (index % 8) - index) / 8),
        index % 8,
        Math.min(index % 8, (index - (index % 8)) / 8),
        (index - (index % 8)) / 8,
        Math.min(7 - (index % 8), (index - (index % 8)) / 8),
    ];
    //for文ループの規則を定めるためのパラメータ定義
    const parameters = [1, 9, 8, 7, -1, -9, -8, -7];
    // ひっくり返せることが確定した石の情報をいれる配列
    let results = [];
    // 8方向への捜査のためのfor文
    for (let i = 0; i < 8; i++) {
        // ひっくり返せる可能性のある石の情報を入れる配列
        const box = [];
        // 現在調べている方向にいくつマスがあるか
        const squareNum = squareNums[i];
        const param = parameters[i];
        // ひとつ隣の石の状態
        const nextStoneState = stoneStateList[index + param];
        //隣に石があるか、及び隣の石が相手の色か　どちらでもない場合は次のループへ
        if (nextStoneState === 0 || nextStoneState === currentColor) continue;
        // 隣の石の番号を仮ボックスに格納
        box.push(index + param);

        for (let j = 0; j < squareNum - 1; j++) {
            const targetIndex = index + param * 2 + param * j;
            const targetColor = stoneStateList[targetIndex];
            // さらに隣に石があるか　なければ次のループへ
            if (targetColor === 0) break;
            if (targetColor === currentColor) {
                //自分の色なら仮ボックスの石がひっくり返せることが確定
                results = results.concat(box);
                break;
            } else {
                // 相手の色なら仮ボックスにその石の番号を格納
                box.push(targetIndex);
            }
        }
    }
    // ひっくり返せると確定した石の番号を戻り値にする
    return results;

}

const createSquares = () => {
    for (let i = 0; i < 64; i++) {
        // テンプレートから要素をクローン
        const square = squareTemplate.cloneNode(true);
        // テンプレート用のid属性を削除
        square.removeAttribute("id");
        // マス目のHTML要素を盤に追加
        stage.appendChild(square);

        const stone = square.querySelector('.stone');
        let defaultState;
        if (i == 27 || i == 36) {
            defaultState = 1;
        } else if (i == 28 || i == 35) {
            defaultState = 2;
        } else {
            defaultState = 0;
        }
        stone.setAttribute("data-state", defaultState);
        // インデックス番号をHTML要素に保持させる
        stone.setAttribute("data-index", i);
        // 初期値を配列に格納
        stoneStateList.push(defaultState);
        square.addEventListener('click', () => {
            onClickSquare(i);
        })
    }
};

window.onload = () => {
    createSquares();
    passButton.addEventListener("click", changeTurn);
}