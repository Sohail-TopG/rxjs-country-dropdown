import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

export interface Country {
  country: string;
  continent: string;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  continentSelect = new FormControl();
  countrySelect = new FormControl();
  continent$: Observable<string>;
  countries: Array<Country>;
  private COUNTRY_URL =
    'https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-continent.json';

  constructor(private http: HttpClient) {
    const country$ = http.get<Country[]>(this.COUNTRY_URL);     //Observable of country data
    this.continent$ = this.continentSelect.valueChanges.pipe(   //Observable of the latest continent selected
      withLatestFrom(country$),          // We combine country selection with the latest list of countries
      map(([continent, countries]) => [  // Now we have an array of two values, first the continent, second the countries
        continent,                       // We return a new array with the continent in first position (untouched)
        countries.filter((c) => c.continent == continent), // And a filtered list of countries (by continent) in second position
      ]),
      tap(([continent, filteredCountries]) => { //The data at that point is: 1) selected continent 2) countries of that continent
        this.countries = filteredCountries;     //Assign the filtered countries to a component property used by the dropdown
        this.countrySelect.setValue(filteredCountries[0].country);  // Select the first country by default
      }),
      map(([continent]) => continent.substring(0, 3).toUpperCase()) // Finally, turn our continent into a 3-letter uppercase string
      // We don't subscribe anymore. The async pipe is doing that on our HTML template.
    );
  }
}
