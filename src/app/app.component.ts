import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import cepPromise from 'cep-promise';
import * as L from 'leaflet';

class EnderecoResposta {
  cep: string;
  state: string;
  city: string;
  street: string;
  neighborhood: string;
  service: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'map-finder';
  formulario: FormGroup;
  estados = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RO", "RS", "RR", "SC", "SE", "SP", "TO"];
  myMap: any;
  urlNominatim = 'https://nominatim.openstreetmap.org';
  coordenadas = {
    lat: 0,
    lon: 0,
  }
  marker: any;
  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.carregarFormulario();
  }

  ngAfterViewInit(): void {
    this.myMap = L.map('mapid').setView([-15.7353743,-47.9036557], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.myMap);
    this.marker = L.marker([-15.7353743, -47.9036557]).addTo(this.myMap);
  }

  carregarFormulario(): void {
    this.formulario = this.formBuilder.group({
      cep: [null],
      log: [null],
      bairro: [null],
      cidade: [null],
      uf: [null],
    })
  }

  buscar(): void {
    const cepInput = this.formulario.controls.cep.value;
    if (cepInput !== null) {
      const cepString = cepInput.split('-').join();
      this.acharEndereco(cepString);
    }
    
  }

  acharEndereco(cep: string): any {
    cepPromise(cep).then((result: EnderecoResposta) => {
      this.preencherEndereco(result);
    })
  };

  preencherEndereco(end: EnderecoResposta): void {
    this.formulario.controls.log.setValue(end.street);
    this.formulario.controls.bairro.setValue(end.neighborhood);
    this.formulario.controls.cidade.setValue(end.city);
    this.formulario.controls.uf.setValue(end.state);
  } 
  buscarGelocalizacao() {
    const logradouro = this.formulario.controls.log.value;
    const bairro = this.formulario.controls.bairro.value;
    const cidade = this.formulario.controls.cidade.value;
    const uf = this.formulario.controls.uf.value;
    this.http.get(this.urlNominatim + `/search?q=${logradouro},${bairro},${cidade},${uf}&format=json&limit=1`).subscribe(
      (result: [{lat: number, lon: number}]) => {
        this.coordenadas.lat = result[0].lat;
        this.coordenadas.lon = result[0].lon;
        console.log(result);
        console.log(this.coordenadas.lat, this.coordenadas.lon);
        this.setarMapa();
      }
    )

  }
  setarMapa(): void {
    this.myMap.setView([this.coordenadas.lat, this.coordenadas.lon], 17);
    this.marker.setLatLng([this.coordenadas.lat, this.coordenadas.lon]);
    
  }
}

// sk.eyJ1IjoiaWFuc2FsZ2FkbyIsImEiOiJja2k2ZnJlcDIwNmsxMnhqdDY4Y2k3Z3M3In0.fWjlgbOMCI7xpGhHxpjqzg