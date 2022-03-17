const CARTE = L.map('carte');
const GEO_CORSE = [42.08467137732747, 9.026854657042184];
const ZOOM_MIN = 8;
const LIMITES = L.latLngBounds([43.15, 8], [41.15, 10.25]);

function charger_carte()
{
    // Paramètrage de la carte.
    CARTE.setMaxBounds(LIMITES);
    CARTE.setView(GEO_CORSE, ZOOM_MIN);
    // Chargement des carreaux depuis OpenStreetMap.
    L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            minZoom: ZOOM_MIN
        }
    ).addTo(CARTE);
}
$(charger_carte);

// API
const ICONE_TAILLE = [32, 32];
function points_api(url, titre, icone, contenu, geo)
{
    $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        success: (retour) => {
        retour.records.forEach(ligne => {
                let c = contenu(ligne.fields);
                let g = geo(ligne.fields);
                let t = titre(ligne.fields);
                if (!!c && !!g && !!t)
                {
                    let popup = L.popup().setContent(c);
                    L.marker(g, {
                        title: t,
                        icon: L.icon({
                            iconUrl: "../img/icones/" + icone + ".png",
                            iconSize: ICONE_TAILLE
                        })
                    }).addTo(CARTE).bindPopup(popup);
                }
            });
        },
        error: (retour) => { console.error(retour); }
    });

}

// Hôtels / Restaurants
const API_HR = "https://www.data.corsica/api/records/1.0/search/?dataset=hotelscorse2017&rows=453";
const ICONE_HR = "hr";
function points_hr() 
{
    points_api(API_HR,
        (e) => { return e.classification_tourinfrance + ' - ' + e.enseigne; },
        ICONE_HR,
        (e) => {
            return "<b>" + e.enseigne + "</b><br><i>" + e.classification_tourinfrance + '<br>' + e.categorie + "</i>" ;
        },
        (e) => { return e.geoloc; }
    );
}
// Patrimoine naturel
const API_NAT = "https://www.data.corsica/api/records/1.0/search/?dataset=patrimoine-naturel-corse&rows=252";
const ICONE_NAT = "nat";
function points_nat() 
{
    points_api(API_NAT,
        (e) => { return e.secteur + ' - ' + e.nom; },
        ICONE_NAT,
        (e) => {
            return "<b>" + e.nom + "</b><br><i>" + e.lieu + "</i>" ;
        },
        (e) => { return e.localisation; }
    );
}
// Patrimoine culturel
const API_CULT = "https://www.data.corsica/api/records/1.0/search/?dataset=patrimoine-culturel-points-dinterets-en-corse&rows=403";
const ICONE_CULT = "cult";
function points_cult() 
{
    points_api(API_CULT,
        (e) => { return e.secteur + ' - ' + e.nom; },
        ICONE_CULT,
        (e) => {
            return "<b>" + e.nom + "</b><br><i>" + e.lieu + "<br>" + e.categorie + "</i>" ;
        },
        (e) => { return e.localisation; }
    );
}

function charger_contenu_carte()
{
    // POINTS
    points_hr();
    points_nat();
    points_cult();
}
$().ready(charger_contenu_carte);
