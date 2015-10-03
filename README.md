# MyAnimeList-Color-Coding
This is a simple greasemonkey script intended to provided some desired functionality around top movie / top manga lists. It has never been easier to keep track of what anime is on your plate.

**Note** 
Images are not mine. I have no intention of using these images for more than personal use and for the userscript itself. Nothing is for sale.

![General Design](/Preview/userscript_preview.PNG)

# Color Coding
Each Label is individually customizable and will display for each anime entry. All colors are saved to internal storage and available on refresh.
![Color Customization](/Preview/userscript_preview2.PNG)

# Watch Now
A link is available to 'Watch Now'. This will redirect the user to http://kissanime.com where a search result will be displayed using the anime's english name. If my anime list is unable to provide an english name from its database, the first synonym will be used. If neither are available, the Japanese name will be used to search KissAnime. The English representations have a higher rate of return for search result opposed to its Japanese counterpart.
![Link to KissAnime.com](/Preview/userscript_preview3.png)

Example of search result...
![Result of Clicking Link](/Preview/userscript_preview5.png)

# User Rankings
User ranking will be displayed in the row data for each anime (0/10). The ranking will only display if the anime is in the user's list. Average community ranking and user ranking are easily comparable.
![User Ranking](/Preview/userscript_preview4.png)
