import {AgmPolylineIcon} from '@agm/core/directives/polyline-icon';
import {NgZone, QueryList} from '@angular/core';
import {fakeAsync, flushMicrotasks, inject, TestBed} from '@angular/core/testing';
import {Subject} from 'rxjs';

import {AgmPolyline} from '../../directives/polyline';
import {GoogleMapsAPIWrapper} from '../../services/google-maps-api-wrapper';
import {Polyline} from '../../services/google-maps-types';
import {PolylineManager} from '../../services/managers/polyline-manager';

describe('PolylineManager', () => {
  beforeAll(() => {
    (<any>window).google = {
      maps: {
        Point: class Point{
          constructor(public x: number, public y: number) {

          }
        },
        SymbolPath: {
          BACKWARD_CLOSED_ARROW: 3,
          BACKWARD_OPEN_ARROW: 4,
          CIRCLE: 0,
          FORWARD_CLOSED_ARROW: 1,
          FORWARD_OPEN_ARROW: 2,
        }
      }
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: NgZone, useFactory: () => new NgZone({enableLongStackTrace: true})},
        PolylineManager, {
          provide: GoogleMapsAPIWrapper,
          useValue: {
            createPolyline: jest.fn(),
            getNativeMap: () => Promise.resolve(),
          }
        }
      ]
    });
  });  // end beforeEach

  describe('Create a new polyline', () => {
    it('should call the mapsApiWrapper when creating a new polyline',
       fakeAsync(inject(
           [PolylineManager, GoogleMapsAPIWrapper],
           (polylineManager: PolylineManager, apiWrapper: GoogleMapsAPIWrapper) => {
             const newPolyline = new AgmPolyline(polylineManager);
             polylineManager.addPolyline(newPolyline);
             flushMicrotasks();
             expect(apiWrapper.createPolyline).toHaveBeenCalledWith({
               clickable: true,
               draggable: false,
               editable: false,
               geodesic: false,
               strokeColor: undefined,
               strokeOpacity: undefined,
               strokeWeight: undefined,
               visible: true,
               zIndex: undefined,
               path: [],
               icons: [],
             });
           })));
  });

  describe('Icons', () => {
    it('should call the mapsApiWrapper when creating a new polyline',
       fakeAsync(inject(
           [PolylineManager, GoogleMapsAPIWrapper],
           (polylineManager: PolylineManager, apiWrapper: GoogleMapsAPIWrapper) => {
             const newPolyline = new AgmPolyline(polylineManager);
             newPolyline.iconSequences = Object.assign(new QueryList<AgmPolylineIcon>(), {
               changes: new Subject<AgmPolylineIcon>(),
               toArray: () => [{
                 fixedRotation: true,
                 offset: '1px',
                 repeat: '50px',
                 anchorX: 10,
                 anchorY: 15,
                 fillColor: 'blue',
                 fillOpacity: 0.5,
                 rotation: 60,
                 scale: 2,
                 strokeColor: 'green',
                 strokeOpacity: 0.7,
                 strokeWeight: 1.5,
                 path: 'CIRCLE',
               }]
             }) as QueryList<AgmPolylineIcon>;
             polylineManager.addPolyline(newPolyline);
             flushMicrotasks();

             expect(apiWrapper.createPolyline).toHaveBeenCalledWith({
               clickable: true,
               draggable: false,
               editable: false,
               geodesic: false,
               strokeColor: undefined,
               strokeOpacity: undefined,
               strokeWeight: undefined,
               visible: true,
               zIndex: undefined,
               path: [],
               icons: [{
                 'fixedRotation': true,
                 'icon': {
                   'anchor': {'x': 10, 'y': 15},
                   'fillColor': 'blue',
                   'fillOpacity': 0.5,
                   'path': 0,
                   'rotation': 60,
                   'scale': 2,
                   'strokeColor': 'green',
                   'strokeOpacity': 0.7,
                   'strokeWeight': 1.5
                 },
                 'offset': '1px',
                 'repeat': '50px'
               }],
             });
           })));
    it('should update the icons when the data structure changes',
       fakeAsync(inject(
           [PolylineManager, GoogleMapsAPIWrapper],
           (polylineManager: PolylineManager, apiWrapper: GoogleMapsAPIWrapper) => {
             const testPolyline = {setOptions: jest.fn()} as any as Polyline;
             (<jest.Mock>apiWrapper.createPolyline).mockReturnValue(Promise.resolve(testPolyline));

             const iconArray = [{
               fixedRotation: true,
               offset: '1px',
               repeat: '50px',
               anchorX: 10,
               anchorY: 15,
               fillColor: 'blue',
               fillOpacity: 0.5,
               rotation: 60,
               scale: 2,
               strokeColor: 'green',
               strokeOpacity: 0.7,
               strokeWeight: 1.5,
               path: 'CIRCLE',
             }];
             const iconChanges = new Subject<AgmPolyline>();

             const newPolyline = new AgmPolyline(polylineManager);
             newPolyline.iconSequences = Object.assign(
                                             new QueryList<AgmPolylineIcon>(),
                                             {changes: iconChanges, toArray: () => iconArray}) as
                 QueryList<AgmPolylineIcon>;

             polylineManager.addPolyline(newPolyline);
             flushMicrotasks();
             iconArray.push({
               fixedRotation: false,
               offset: '2px',
               repeat: '20px',
               anchorX: 11,
               anchorY: 16,
               fillColor: 'cyan',
               fillOpacity: 0.6,
               rotation: 120,
               scale: 0.5,
               strokeColor: 'yellow',
               strokeOpacity: 0.2,
               strokeWeight: 3,
               path: 'BACKWARD_OPEN_ARROW',
             });
             polylineManager.updateIconSequences(newPolyline);

             flushMicrotasks();
             expect((testPolyline.setOptions as jest.Mock).mock.calls.length).toBe(1);
             expect((testPolyline.setOptions as jest.Mock).mock.calls[0][0]).toEqual({
               'icons': [
                 {
                   'fixedRotation': true,
                   'icon': {
                     'anchor': {'x': 10, 'y': 15},
                     'fillColor': 'blue',
                     'fillOpacity': 0.5,
                     'path': 0,
                     'rotation': 60,
                     'scale': 2,
                     'strokeColor': 'green',
                     'strokeOpacity': 0.7,
                     'strokeWeight': 1.5
                   },
                   'offset': '1px',
                   'repeat': '50px'
                 },
                 {
                   'fixedRotation': false,
                   'icon': {
                     'anchor': {'x': 11, 'y': 16},
                     'fillColor': 'cyan',
                     'fillOpacity': 0.6,
                     'path': 4,
                     'rotation': 120,
                     'scale': 0.5,
                     'strokeColor': 'yellow',
                     'strokeOpacity': 0.2,
                     'strokeWeight': 3
                   },
                   'offset': '2px',
                   'repeat': '20px'
                 }
               ]
             });
           })));
  });

  describe('Delete a polyline', () => {
    it('should set the map to null when deleting a existing polyline',
       fakeAsync(inject(
           [PolylineManager, GoogleMapsAPIWrapper],
           (polylineManager: PolylineManager, apiWrapper: GoogleMapsAPIWrapper) => {
             const newPolyline = new AgmPolyline(polylineManager);

             const polylineInstance: Partial<Polyline> = {setMap: jest.fn()};
             (<jest.Mock>apiWrapper.createPolyline)
                 .mockReturnValue(Promise.resolve(polylineInstance));

             polylineManager.addPolyline(newPolyline);
             flushMicrotasks();
             polylineManager.deletePolyline(newPolyline);
             flushMicrotasks();
             expect(polylineInstance.setMap).toHaveBeenCalledWith(null);
           })));
  });
});
