document.addEventListener("DOMContentLoaded", function(){

const herni_plocha = document.getElementById("herni_plocha");
const instrukce = document.getElementById("instrukce");
const celkove_skore = document.getElementById("celkove_skore");
const nejvyssi_skore = document.getElementById("nejvyssi_skore");

const velikostMrizky = 15;
//souřadnice první pozice v mřížce -> postupně se přidávají další 
let poziceHada = [{ x: 10, y: 10}];
let smerHada = 'vpravo';
let poziceJidla = nahodnaPozice(); //spawnuje se i kde má had tělo (ve verzi 2.0 bude opraveno XD)
let hraInterval;
let rychlostHry = 200;
let hraZacala = false;
let nejvyssiSkore = -1;

/* ----------------------------------------------------- */

document.addEventListener('keydown', stiskKlavesy);

/* ----------------------------------------------------- */

//mapa, had, jidlo -> vykresleni
function vykresli(){
    herni_plocha.innerHTML = ''; //restart
    vykresliHada();
    vykresliJidlo();
    aktualizujSkore();
}

function vykresliHada(){
    if(hraZacala){

           //had se postupně zvetsuje -> (prochází se postupně jeho "pozice/části") -> při spuštění: { x: 10, y: 10}  
            for(i = 0; i < poziceHada.length; i++){
            //nový tag, abychom si připravili jeho část
            const castHadaTag = vytvorCast('div', 'had'); // tag + trida
            //části přiřadíme pozici
            nastavPozici(castHadaTag, poziceHada[i]);
                //styl hlavyř se musí řešit samostatně
                if(i == 0){
                switch(smerHada){
                    case 'vpravo':
                    castHadaTag.style.backgroundImage = "url('textury/hlava_vpravo.png')";
                    break;
            
                    case 'vlevo':
                    castHadaTag.style.backgroundImage = "url('textury/hlava_vlevo.png')";
                    break;
            
                    case 'nahoru':
                    castHadaTag.style.backgroundImage = "url('textury/hlava_nahoru.png')";
                    break;
            
                    case 'dolu':
                    castHadaTag.style.backgroundImage = "url('textury/hlava_dolu.png')";
                    break;
                }
                }
                herni_plocha.appendChild(castHadaTag);
            }
    }
}

//funguje jako předchozí funkce, jen pracujeme s 1 pozicí
function vykresliJidlo(){

        if(hraZacala){
        const jidlo = vytvorCast('div', 'jedlo');
        nastavPozici(jidlo, poziceJidla);
        herni_plocha.appendChild(jidlo);
        }

}

/* ----------------------------------------------------- */

//připraví prvek
function vytvorCast(tag, trida){

    const cast = document.createElement(tag); //např <div id="had">
    cast.className = trida;

    return cast;
}

//nastaví se pozice prvku v mřížce
function nastavPozici(cast, pozice){

    //[{ x: pozice.x, y: pozice.y}]
    cast.style.gridColumn = pozice.x;
    cast.style.gridRow = pozice.y;

}

function nahodnaPozice(){

    //<1;velikostMrizky> + potřebujeme celé číslo
    const poziceX = Math.floor(Math.random() * velikostMrizky) + 1;
    const poziceY =  Math.floor(Math.random() * velikostMrizky) + 1;

    return { x: poziceX, y: poziceY};
}

/* ----------------------------------------------------- */

function pohybHada(){
    const hlavaHada = { ...poziceHada[0] } 

    switch(smerHada){
        case 'vpravo':
            hlavaHada.x++;
            break;

        case 'vlevo':
            hlavaHada.x--;
            break;

        case 'nahoru':
            hlavaHada.y--;
            break;

        case 'dolu':
            hlavaHada.y++;
            break;
    }

    //přidání nové souřadnice do pole
    poziceHada.unshift(hlavaHada);
    if(hlavaHada.x == poziceJidla.x && hlavaHada.y == poziceJidla.y){ 
        let kontrola;
        do{
            kontrola = true;
            poziceJidla = nahodnaPozice();
            poziceHada.forEach(cast => {
                if(cast.x == poziceJidla.x && cast.y == poziceJidla.y ){
                    kontrola = false;
                }
            });
        }while(!kontrola);


        zvysRychlost();
        //reset intervalu -> vždy, když se had nají začne nový
        clearInterval(hraInterval);
        hraInterval = setInterval(() => {
            pohybHada();
            kontrolaNarazu();
            vykresli();
        }, rychlostHry); 
    }else{
    //odstranění poslední souřadnice v poli
    //když bere jídlo, roste -> když nebere jídlo, neroste (je potřeba pop)
    poziceHada.pop();
    }

}

//  W/A/S/D = KeyW/A/S/D/W; šipky = ArrowLeft/Right/Up/Down

function stiskKlavesy(event){

    if(!hraZacala && event.key === 'e'){
        zapniHru();
    }else{
        switch(event.key){

            case 'ArrowRight':
            case 'd':
                smerHada = 'vpravo';
                break;

            case 'ArrowLeft':
            case 'a':
                smerHada = 'vlevo';
                break;

            case 'ArrowUp':
            case 'w':
                smerHada = 'nahoru';
                break;

            case 'ArrowDown': 
            case 's': 
                smerHada = 'dolu';
                break;

        }
    }
}

function zvysRychlost(){
    if(rychlostHry > 150){
        rychlostHry -= 5;
    }else if(rychlostHry > 100){
        rychlostHry -= 3;
    }else if(rychlostHry > 100){
        rychlostHry -= 2;
    }else if(rychlostHry > 50){
        rychlostHry -= 1;
    }
}
 
function kontrolaNarazu(){
    const hlavaHada = poziceHada[0];

    //náraz do stěny
    if(hlavaHada.x < 1 || hlavaHada.x > velikostMrizky || hlavaHada.y < 1 || hlavaHada.y > velikostMrizky){
        restartHry();
    }

    //náraz hada do sebe
    for (let i = 1; i < poziceHada.length; i++){
        if(hlavaHada.x == poziceHada[i].x && hlavaHada.y == poziceHada[i].y){
            restartHry();
        }
    }
}

/* ----------------------------------------------------- */

function aktualizujSkore(){
    const skoreTed = poziceHada.length - 1;
    celkove_skore.textContent = skoreTed.toString().padStart(4, '0');
}

function aktualizujNejvyssiSkore(){
    const skoreTed = poziceHada.length - 1;
    if(skoreTed > nejvyssiSkore){
        nejvyssi_skore.textContent = skoreTed.toString().padStart(4, '0');
        nejvyssi_skore.style.display = 'block';
        nejvyssiSkore = skoreTed;
    }
}

/* ----------------------------------------------------- */

function zapniHru(){
    hraZacala = true;
    instrukce.style.display = 'none';
    hraInterval = setInterval(() => {
        pohybHada();
        kontrolaNarazu();
        vykresli();
    }, rychlostHry); 
}

function restartHry(){
    aktualizujNejvyssiSkore();
    zastavhru();
    poziceHada = [{ x: 10, y: 10}];
    poziceJidla = nahodnaPozice();
    rychlostHry = 200;
    aktualizujSkore();
}

function zastavhru(){
    clearInterval(hraInterval);
    hraZacala = false;
    instrukce.style.display = 'block';
}

});