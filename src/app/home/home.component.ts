import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


interface Data {
  name: string,
  image: string,
  description: string,
  dateLastEdited: string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  items: Data[] = [];
  filteredItems: Data[] = [];
  searchText: string = '';
  sortCriteria: string = '';

  pageSize: number = 5;
  pageIndex: number = 0;

  constructor( private router : Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadState();
    this.http.get<Data[]>("assets/mock_data.json").subscribe(data => {
      this.items = data;
      this.filteredItems = [...this.items]
      this.applyFilters();
    });

  }

  search(){
    this.saveState();
    this.applyFilters();
  }

  onSortChange(){
    this.saveState();
    this.applyFilters();
  }

  clear(){
    this.searchText='';
    this.saveState();
    this.applyFilters();
  }

  saveState(): void {
    const state = {
      searchText: this.searchText,
      sortCriteria: this.sortCriteria
    };
    localStorage.setItem('homeComponentState', JSON.stringify(state));
  }

  loadState(): void {
    const state = localStorage.getItem('homeComponentState');
    if (state) {
      const parsedState = JSON.parse(state);
      this.searchText = parsedState.searchText;
      this.sortCriteria = parsedState.sortCriteria;
    }
  }

  applyFilters(): void{
    this.searchMethod();
    this.onSortChangeMethod();
  }

  onSortChangeMethod(): void {
    switch (this.sortCriteria) {
      case 'name ASC':
        this.filteredItems = this.filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name DESC':
        this.filteredItems = this.filteredItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'dateLastEdited ASC':
        this.filteredItems = this.filteredItems.sort((a, b) => new Date(a.dateLastEdited).getTime() - new Date(b.dateLastEdited).getTime());
        break;
      case 'dateLastEdited DESC':
        this.filteredItems = this.filteredItems.sort((a, b) => new Date(b.dateLastEdited).getTime() - new Date(a.dateLastEdited).getTime());
        break;
      default:
        break;
    }
  }

  searchMethod() {
    let quoted: Boolean = false;
    if (!this.searchText.trim()) {
      this.filteredItems = [...this.items]; // Reset to show all items if search text is empty
      console.log('clicked without any search term')
      return;
    }

    let terms: string[] = []
    let trimmerSearchText = this.searchText.trim();
    if(!(trimmerSearchText[0]=='"' && trimmerSearchText[trimmerSearchText.length-1]=='"'))
      terms =  this.searchText.trim().toLowerCase().split(' ');
    else
    {
      quoted = true;
      terms = [this.searchText.trim()]
    }
      
    const filtered: any[] = [];
    this.searchText.trim().toLowerCase().split(' ');

    for (let item of this.items) {
      let match = true;
      for (let term of terms) {
        if (quoted) {
          // Exact phrase search
          let phrase = term.substring(1, term.length - 1).toLowerCase();
          if (!(item.name.toLowerCase().includes(phrase) || item.description.toLowerCase().includes(phrase))) {
            match = false;
            break;
          }
        } else {
          // Normal word search
          if (!(item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term))) {
            match = false;
            break;
          }
        }
      }
      if (match) {
        filtered.push(item);
      }
    }
    this.filteredItems = filtered;
  }
}
