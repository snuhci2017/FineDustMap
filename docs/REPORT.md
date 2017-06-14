# FineDustMap
* Fine Dust Map Visualization for policy makers
* 팀원: 김민지 김동주

## Goal
**미세먼지 농도**와 **화력 발전소**, **바람 방향**을 시각화함으로써 정책 결정자가 미세먼지의 원인을 이해하고 그에 대한 대응 방안을 마련할 수 있도록 돕는다

## Github Page
* https://snuhci2017.github.io/FineDustMap/src/
* chrome 방화벽 해제, 안전하지 않은 스크립트 로드

## Data

> **Topo JSON data**

> - 대한민국 전체 행정구역 json file : [skorea-province-simple.json]
> - 시군구별 json file : [행정구역이름-topo.json]
> - 웹 상에 지도를 그리기 위한 데이터. geo json보다 simple하고 가볍다.


> **미세먼지 농도 csv data**

> - Latest 시도별 미세먼지 농도 data
> - Latest 시군구별 미세먼지 농도 data
> - 시도별 미세먼지 과거 데이터(2016년)
> - 시군구별 미세먼지 과거 데이터(2016년)
> - preprocessing: MySQL
> - 과거 데이터의 경우 약 300만 row를 정제했다 
> - MySQL code


> **해안 풍향/풍속 data**

> - 측정 source: 부표
> - speed(m/s), direction(degree)
> - source의 위치(longitude, latitude)


> **화력 발전소 data**

> - 위치 데이터(latitude, longitude)
> - emission data: 데이터가 충분하지 않았다
> - 일부 발전소에서만 주기적으로 미세먼지 배출 농도가 공공데이터로 제공되었다
> - 2015년까지만 제공되고 최신 데이터는 업데이트되지 않은 경우도 있었다
> - 주로 월별 데이터로 제공되었고, 일별 데이터는 찾기 힘들었다


## Persona
충청남도 도의원 안찰스씨는 52세로, 두 딸과 아내와 함께 충청남도 당진시에 거주하고 있다. 
그의 가장 큰 관심사는 새로운 정책을 제안하고 통과시킴으로써 정치적 평판을 올리는 것이다. 
그는 요즈음 이슈인 미세먼지에 관심이 있었으나 정부가 원인의 80% 이상을 중국에게 돌리자 도의원으로서 할 수 있는 일은 없다고 판단했다. 
하지만 정부가 바뀌고, 새로운 미세먼지 정책이 나오면서 안찰스씨는 다시 미세먼지에 관심을 기울이게 되었다. 
그는 충청남도가 전국 미세먼지 1위라는 사실을 적시하고 있으나 정확한 원인이 어디서부터 나오는지 정확한 연구 결과나 
데이터 분석을 찾기가 힘들었고, 전문가의 조언도 쉽게 이해하기 어려웠다. 비전문가인 그는 알아듣기 쉬우면서도 
정확한 미세먼지에 대한 통찰을 얻고자 한다. 


## Functionality


## Design
* Color
**ColorBrewer**의 4 data classes, diverging color type을 사용했다.
사용자가 빨간색은 나쁨, 초록색은 안전/깨끗함으로 생각하는 경향이 있기 때문에 미세먼지 농도 좋음을 초록, 나쁨을 빨강으로 결정했다.
자주색 계열의 색깔을 사용하면 색맹 사용자의 편의까지 고려할 수 있었으나, primary users인 정책 결정자의 다수가 색맹이 아니라고 가정하면
지도를 보았을 때 특정 지역의 미세먼지 농도의 심각성을 바로 알 수 있는가에 초점을 두는 게 더 좋은 방법이라고 판단했다.
지도 위에서 색은 ordering이 아닌 categorical method로 사용되었다. 때문에 color luminance나 color saturation을
사용하는 것보다 color hue를 사용하는 것이 더 좋은 방법이었다. Categorical Attribute를 표현하는 방법으로 color hue보다 
spatial region이 효과적일 수 이지만, 지도상에 표현되는 데이터는 이미 지역과 데이터 value(이 경우, 미세먼지 농도)를 함께 표현해야
하기 때문에 적합하지 않았다. 따라서 그 뒤를 잇는 가장적합한 방법이 color hue라고 판단했다. 
사용자에 따라 category보다는 미세먼지의 정확한 값을 알고자할 수 있기 때문에 mouseover event를 통해 해당 지역의 미세먼지 농도를
알 수 있도록 했다. Saturation을 통해 미세먼지 농도를 표현한다면 보다 실제 값의 정도를 잘 알 수 있지만, 위험 기준에 해당하는 지의
여부를 한 눈에 보기 어렵다는 단점이 있다. 따라서 detail-on-demand로 지도 구역을 클릭한 후 자세한 data를 볼 수 있도록 했고,
지도에서는 color를 통해 위험 기준에 해당하는 지의 여부를 보여주었다.
* Spatial Region
지도 위에 
* Switch Button
* Slider
Visual Encoding - position on common scale
* Legend
* Animation
* Chart: Line graph

> **Design Principle**

>- Rapid, Incremental, Reversible
>- Feedback
>- Encourage Exploration
>- Overview first, Zoom and filter, Details on demand
>- Tell the Truth
>- Misrepresentation?
>- Narative of Space and Time


## Scenario
충청남도 도지사 안찰스씨는 인터넷에서 FineDustMap 사이트를 발견하고 방문한다. 

## Expectation
* Deciding where to build a new measuring station
* Thinking about the reasons of the fine dust
* Deciding to build a fine dust reduction device in the power plant
* Deciding where to concentrate the effort to reduce fine dust
* Knowing the degree of the fine dust in a certain district
* Understanding the changing fine dust density with the wind direction


## Further
* Add more past data
* Simulation with  Thermal Power Plant (On/Off)
* Add China’s Dust density visualization
* Real Time Service (github page: static)
