// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%Y-%m-%d");

// Array of days of week (used in lineplot tooltip)
let weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Selectbox function for lineplot
let selectedCategory = d3.select("#categorySelector").property("value")
function categoryChange() {
    selectedCategory = d3.select("#categorySelector").property("value");
    lineplot_all.wrangleData();
}
console.log(selectedCategory)


// Dictionary state populations
let state_populations
d3.csv("data/state_populations_processed.csv", d => {
    d.population = +(d.population.replace(/,/g, ''))
    d.state = d.state.replace('.', '')
    return d
}).then(data => {
    state_populations = data
})

// Dictionary of state abbreviations
let stateAbbrev = {
    'AL':'Alabama',
    'AK':'Alaska',
    'AZ':'Arizona',
    'AR':'Arkansas',
    'CA':'California',
    'CO':'Colorado',
    'CT':'Connecticut',
    'DE':'Delaware',
    'DC':'District of Columbia',
    'FL':'Florida',
    'GA':'Georgia',
    'GU':'Guam',
    'HI':'Hawaii',
    'ID':'Idaho',
    'IL':'Illinois',
    'IN':'Indiana',
    'IA':'Iowa',
    'KS':'Kansas',
    'KY':'Kentucky',
    'LA':'Louisiana',
    'ME':'Maine',
    'MD':'Maryland',
    'MA':'Massachusetts',
    'MI':'Michigan',
    'MN':'Minnesota',
    'MS':'Mississippi',
    'MO':'Missouri',
    'MT':'Montana',
    'NE':'Nebraska',
    'NV':'Nevada',
    'NH':'New Hampshire',
    'NJ':'New Jersey',
    'NM':'New Mexico',
    'NY':'New York',
    'NC':'North Carolina',
    'ND':'North Dakota',
    'OH':'Ohio',
    'OK':'Oklahoma',
    'OR':'Oregon',
    'PA':'Pennsylvania',
    'PR':'Puerto Rico',
    'RI':'Rhode Island',
    'SC':'South Carolina',
    'SD':'South Dakota',
    'TN':'Tennessee',
    'TX':'Texas',
    'UT':'Utah',
    'VT':'Vermont',
    'VA':'Virginia',
    'WA':'Washington',
    'WV':'West Virginia',
    'WI':'Wisconsin',
    'WY':'Wyoming'
}

// Array of 50 visually distinct colors, as computed by https://mokole.com/palette.html
let colorArray = ['#c0c0c0',
                '#2f4f4f',
                '#556b2f',
                '#a0522d',
                '#2e8b57',
                '#228b22',
                '#800000',
                '#708090',
                '#808000',
                '#483d8b',
                '#cd853f',
                '#4682b4',
                '#9acd32',
                '#20b2aa',
                '#cd5c5c',
                '#4b0082',
                '#32cd32',
                '#daa520',
                '#8fbc8f',
                '#8b008b',
                '#9932cc',
                '#ff4500',
                '#ff8c00',
                '#ffd700',
                '#ffff00',
                '#0000cd',
                '#deb887',
                '#00ff00',
                '#00ff7f',
                '#e9967a',
                '#dc143c',
                '#00ffff',
                '#00bfff',
                '#0000ff',
                '#a020f0',
                '#adff2f',
                '#ff7f50',
                '#ff00ff',
                '#db7093',
                '#f0e68c',
                '#6495ed',
                '#dda0dd',
                '#90ee90',
                '#ff1493',
                '#7b68ee',
                '#afeeee',
                '#ee82ee',
                '#7fffd4',
                '#ff69b4',
                '#ffb6c1']