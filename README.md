# CS171 Final Project: Locked Down

### How well did people follow lockdown restrictions during the COVID-19 pandemic?
### A visual exploration of human movement in the US in 2020

---
Link to project website: https://aspartate.github.io/lockdown-mobility/

Link to screencast video: https://youtu.be/VPgkSJF24JQ

Link to process book: https://docs.google.com/document/d/1zaSy837_oBmRkFeu0_GBk_9hskaYWdSc4a4QbgZzOJc/edit#heading=h.87xhwgz7bayx

- Files:
  - backgrounds/
  - css/
      - main.css; CSS styling for main website, section snapping
      - fig1.css; Special CSS styling for fig. 1
      - fig3.css; Special CSS styling for fig. 3
  - data/ 
    - state_dex_processed.csv; all of the 2020 DEX data from https://github.com/COVIDExposureIndices/COVIDExposureIndices, preprocessed using dex_data_prep.ipynb 
    - state_lex_processed.csv; all of the 2020 LEX data from https://github.com/COVIDExposureIndices/COVIDExposureIndices, preprocessed using lex_data_prep.ipynb
    - state_lockdowns.csv; hand-curated list of each state and their corresponding lockdown period, from https://www.nbcnews.com/health/health-news/here-are-stay-home-orders-across-country-n1168736
    - state_populations_processed.csv; table of each state and their respective population, from https://www.kaggle.com/peretzcohen/2019-census-us-population-data-by-state
  - fonts/
  - images/
  - js/
    - main.js; imports the data and instantiates the visualizations
    - main_utils.js; contains utility functions used throughout all visualizations
    - d3-simple-slider.js; slider library from https://github.com/johnwalley/d3-simple-slider
    - fig1_utils.js; utility functions for fig.1
    - fig1_lineplot.js; contains class for lineplot, fig.1 left side
    - fig1_map.js; contains class for map, fig.1 right side
    - fig2_utils.js; utility functions for fig.2
    - fig2_matrix.js; contains class for matrix, fig.2 left side
    - fig2_map.js; contains class for map, fig.2 right side
    - fig3_utils.js; utility functions for fig.3
    - fig3_lineplot.js; contains class for lineplot, fig.3 left side
    - fig3_violinplot.js; contains class for violinplot, fig.3 right side
    - fig4_utils.js; utility functions for fig.4
    - fig4_lineplot.js; contains class for lineplot & timeline, fig.4
  - preprocessing/
    - dex_data_prep.ipynb; Python notebook for preprocessing DEX data (adding in 7-day moving average)
    - lex_data_prep.ipynb; Python notebook for preprocessing LEX data
    - state_dex.csv; raw DEX data
    - state_lex_raw.zip; raw LEX data
  - index.html; main html file that is rendered in browser, includes all text and styling outside the visualizations
