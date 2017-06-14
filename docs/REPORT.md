# FineDustMap
* Fine Dust Map Visualization for policy makers
* 팀원: 김민지 김동주

## Goal
**미세먼지 농도**와 **화력 발전소**, **바람 방향**을 시각화함으로써 정책 결정자가 미세먼지의 원인을 이해하고 그에 대한 대응 방안을 마련할 수 있도록 돕는다

## Github Page
* https://snuhci2017.github.io/FineDustMap/src/
* chrome 방화벽 해제, 스크립트 로드 가능

## Data

> **Topo JSON data**

> - 대한민국 전체 행정구역 json file: <skorea-province-simple.json>
> - 시군구별 json file: <행정구역이름-topo.json>
> - 웹 상에 지도를 그리기 위한 데이터. geo json보다 simple하고 가볍다.


> **미세먼지 농도 csv data**

> - Latest 시도별 미세먼지 농도 data
> - Latest 시군구별 미세먼지 농도 data
> - 시도별 미세먼지 과거 데이터(2016년)
> - 시군구별 미세먼지 과거 데이터(2016년)
> - preprocessing: MySQL
> - 과거 데이터의 경우 약 300만 row를 정제했다 


> **해안 풍향/풍속 data**

> - 측정 source: 부표
> - speed(m/s), direction(degree)


> **화력 발전소 data**
> - 화력 발전소 위치 데이터