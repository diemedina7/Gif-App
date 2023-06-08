import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SearchResponse, Gif } from '../interfaces/gifs';

@Injectable({
  providedIn: 'root'
})
export class GifsService {

  public gifList: Gif[] = [];

  private apiKey: string = "JHPVqSWQHWeVnbTm51dkzzbJjeBVwqvf";
  private serviceUrl: string = 'https://api.giphy.com/v1/gifs'
  private _tagsHistory: string[] = [];

  constructor(private http: HttpClient) {
    this.loadLocalStorage();
  }


  get tagsHistory() {
    //retornamos una copia, se rompe la referencia al objeto
    return [...this._tagsHistory];
  }

  private organizeHistory(tag: string) {
    tag = tag.toLowerCase().trim();

    if(this._tagsHistory.includes(tag))
      //devolvemos un nuevo arreglo con todos los elementos cuya validacion interna del filter sea igual a true
      this._tagsHistory = this._tagsHistory.filter((oldTag) => oldTag !== tag);

    this._tagsHistory.unshift(tag);
    this._tagsHistory = this._tagsHistory.splice(0, 10);  //retorno los primeros 10 elementos del array, mantengo el length = 10

    this.saveLocalStorage();
  }

  private saveLocalStorage(): void {
    localStorage.setItem("history", JSON.stringify(this._tagsHistory));
  }

  private loadLocalStorage(): void {
    if(!localStorage.getItem("history"))
      return;

    this._tagsHistory = JSON.parse(localStorage.getItem("history")!);
    this.searchTag(this._tagsHistory[0]);
  }

  public searchTag(tag: string): void {
    if(tag === "") return;
    if(tag.trim().length === 0)  return;

    this.organizeHistory(tag);

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('limit', 10)
      .set('q', tag);

    this.http.get<SearchResponse>(`${this.serviceUrl}/search`, { params: params })
      .subscribe(resp => {
        this.gifList = resp.data;
        //console.log({gifs: this.gifList});
      });
  }
}
