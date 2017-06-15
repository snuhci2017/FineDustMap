# FineDustMap
* Fine Dust Map Visualization for policy makers
* 팀원: 김민지(2014-16775) 김동주(2014-15487)

## Goal
**미세먼지 농도**와 **화력 발전소**, **바람 방향**을 시각화함으로써 정책 결정자가 미세먼지의 원인을 이해하고 그에 대한 대응 방안을 마련할 수 있도록 돕는다

## Background
* 미세먼지의 원인: 중국발 미세먼지, 자동차 배기가스, 공장의 질소화합물, 화력 발전소, 생물학적 연소
* 정책화 부족: 미세먼지의 원인과 현황에 대한 정확한 정보 제공의 필요성
* 기존의 미세먼지 시각화 사이트에서는 과거 데이터를 단순히 통계 수치로만 제공하기 때문에 지도와 그래프의 애니메이션를 보여줌으로써 그 변화를 눈으로
볼 수 있도록 하였다. 또한 미세먼지의 내부적 요인 중 가장 큰 원인이라고 생각되는 화력 발전소의 위치와 풍향 데이터를 함께 시각화함으로써 미세먼지의 
원인에 대한 통찰을 가질 수 있도록 한다.

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
```{.SQL}
CREATE TABLE TEMP
(
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  LOC VARCHAR(100) NOT NULL,
    LOC_1 VARCHAR(50) NOT NULL,
    DATE1 VARCHAR(12) NOT NULL,
    PM10 INT NOT NULL DEFAULT -1,
    PM25 INT NOT NULL DEFAULT -1,
    PRIMARY KEY (id)
) ENGINE=INNODB;

SELECT TA.DATE1, TA.LOC, TB.a_pm10, IFNULL(TC.a_pm25, 0) a_pm25
FROM (SELECT DATE1, LOC FROM TEMP GROUP BY 1, 2) TA
  LEFT JOIN (select DATE1, LOC, AVG(PM10) a_pm10 from TEMP where PM10 > 0 GROUP BY 1, 2) TB
    ON TA.DATE1 = TB.DATE1 AND TA.LOC = TB.LOC
  LEFT JOIN (select DATE1, LOC, AVG(PM25) a_pm25 from TEMP where PM25 > 0 GROUP BY 1, 2) TC
    ON TA.DATE1 = TC.DATE1 AND TA.LOC = TC.LOC
ORDER BY 1, 2;

SELECT TA.DATE1, TA.LOC, TA.LOC_1, TB.a_pm10, IFNULL(TC.a_pm25, 0) a_pm25
FROM (SELECT DATE1, LOC, LOC_1 FROM TEMP GROUP BY 1, 2, 3) TA
  LEFT JOIN (select DATE1, LOC, LOC_1, AVG(PM10) a_pm10 from TEMP where PM10 > 0 GROUP BY 1, 2, 3) TB
    ON TA.DATE1 = TB.DATE1 AND TA.LOC = TB.LOC AND TA.LOC_1 = TB.LOC_1
  LEFT JOIN (select DATE1, LOC, LOC_1, AVG(PM25) a_pm25 from TEMP where PM25 > 0 GROUP BY 1, 2, 3) TC
    ON TA.DATE1 = TC.DATE1 AND TA.LOC = TC.LOC AND TA.LOC_1 = TC.LOC_1
ORDER BY 1, 2;
```


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
* Primary: 정책결정자
충청남도 도의원 안찰스씨는 52세로, 두 딸과 아내와 함께 충청남도 당진시에 거주하고 있다. 
그의 가장 큰 관심사는 새로운 정책을 제안하고 통과시킴으로써 정치적 평판을 올리는 것이다. 
그는 요즈음 이슈인 미세먼지에 관심이 있었으나 정부가 원인의 80% 이상을 중국에게 돌리자 도의원으로서 할 수 있는 일은 없다고 판단했다. 
하지만 정부가 바뀌고, 새로운 미세먼지 정책이 나오면서 안찰스씨는 다시 미세먼지에 관심을 기울이게 되었다. 
그는 충청남도가 전국 미세먼지 1위라는 사실을 적시하고 있으나 정확한 원인이 어디서부터 나오는지 정확한 연구 결과나 
데이터 분석을 찾기가 힘들었고, 전문가의 조언도 쉽게 이해하기 어려웠다. 비전문가인 그는 알아듣기 쉬우면서도 
정확한 미세먼지에 대한 통찰을 얻고자 한다. 

* Secondary: 미세먼지 농도와 그 추이를 확인하고자 하는 일반 시민들


## Functionality
* 지도상에서 최신 미세먼저 농도와 위험 기준 확인
* 과거 데이터에 대한 미세먼지 농도 변화 추이 확인
* 지역구별 미세먼지의 농도와 발전소 위치 확인
* 해안가 바람 방향과 풍속 확인
* 미세먼지 농도 데이터에 대한 꺾은선 그래프로 농도 변화 추이 확인

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
 
* Switch Button

pm10과 pm2.5를 선택하는 버튼은 toggle button보다는 slider가 달린 switch 버튼으로 구현하였다. 선택지가 두 가지밖에 없는
경우이므로 사용자가 직관적으로 두 가지 중 선택할 수 있다고 생각했기 때문이다.

* Slider

Slider는 사용자가 확인하고자 하는 과거 데이터의 기간을 선택하는 interface로 사용하였다. slider의 handle은 start date와
end date를 각각 선택할 수 있도록 두 가지이다. handle의 위치에 따라 선택하는 날짜가 달라지는데, 위치에 따라서 ordering이 달라지는
경우에 해당하므로 이 역시 사용자가 직관적으로 사용하기에 편리한 interface이다.

* Animation

Timer를 설정해 사용자가 설정한 기간동안 1일/1초의 속도로 지도상의 색깔과 풍향, 그래프를 변화시켜 보여준다.

* Chart: Line graph
과거 시점의 미세먼지의 농도를 시각화하기 위하여 꺾은선 그래프를 사용하였다. 이는 꺾은선 그래프가 미세먼지의 농도가 시간이 흐름에 따라 연속적으로 변하는 것을 
한 눈에 알아볼 수 있게 해주어 변화의 추세를 파악하기 쉽게 만들어주기 때문이다. 또한 공간의 효율적 활용을 위해 PM10과 PM2.5의 농도를 서로 다른 색을 이용하여 같이 표기하였다. 이 때, 두 축의 도메인이 달라서 더 작은 값이 꺾은선 그래프 상에서 위에 그려지는 문제점이 있으나 우리의 관심사는 PM10과 PM2.5사이의
비교가 아니라 각 데이터 내부에서의 비교이기 때문에 이 방식을 선택하였다. 또 정확한 값을 알기 어렵다는 꺾은선 그래프의 단점을 해결하기 위해 mouseover 이벤트를 사용하여 해당 x축 상에서의 농도값들을 표시하여 주는 tooltip을 사용하였다.

> **Design Principle**

>- Rapid, Incremental, Reversible

화면이 로드한 후에 백그라운드에서 데이터를 로드하도록 해서 속도를 줄였다. 하지만 topo json 데이터의 크기가 크고, 미세먼지 데이터가
매우 커서 로드하는데 어느정도의 시간이 걸린다. 1~2초 내에 사용자에게 피드백을 제공할 수 있고, detail page에서 home page로 돌아가는
홈 버튼도 추가하여 reversibility를 지키도록 했다. 

>- Feedback

사용자가 지도 위에 마우스를 옮겨가면 자세한 데이터의 수치를 보여주고, 그래프에 대해서도 tooltip을 추가하여 구체적인 수치 정보를 확인할 수 있
도록 했다. 지도를 클릭할 시에 그에 대한 더 자세한 정보를 제공하기 위해 페이지를 이동하고, 한 번 더 클릭할 시에 더 자세한 정보를 제공한다.

>- Encourage Exploration

사용자가 지도를 보고 특정 지역구에 대한 궁금증으로 지도를 클릭해볼 수 있다. 또한 더 자세한 시군구 데이터에 대해 궁금할 경우 클릭하면 zoom-in
하고, 그래프의 데이터도 해당되는 데이터로 바꾸어 보여준다. 사용자는 slider에 대해서도 동일한 궁금증으로 재생 버튼을 눌렀을 때의 동작을 확인해볼 
수 있다. 

>- Overview first, Zoom and filter, Details on demand

가장 먼저 페이지르 띄웠을 때는 전국 지도를 통해 overview를 보여주고, 사용자가 지도를 클릭했을 시에는 페이지를 이동하여 해당 지역구에만 해당되는 
데이터를 보여준다. 지도를 한 번 더 클릭하면 zoom-in하면서 더 자세한 데이터를 보여주고, mouseover와 그래프를 통해서 더 자세한 수치를 직접 
확인할 수 있도록 했다.


## Scenario
충청남도 도지사 안찰스씨는 인터넷에서 FineDustMap 사이트를 발견하고 방문한다. 그는 먼저 전국의 미세먼지 농도를 살핀 후
충청남도의 미세먼지 농도에 관심을 가지고 클릭한다. 이동한 detail page에서 그가 충청남도의 지도 군데군데 하얗게 비어있는 것을 발견하고
마우스를 가져가자 해당 지역이 No data인 것을 확인할 수 있었다. 그는 미세먼지 데이터를 알 수 있는 지역들에 대해서 mouse over로 값들을
확인하고, switch를 통해 pm2.5로 옮긴다. 충청남도의 화력 발전소 위치와 그 주변의 미세먼지 농도를 확인하고, 우측의 그래프를 통해
해당 기간 동안 미세먼지 농도가 어떻게 변화해오고 있는 지 확인한다. 특히 미세먼지의 농도가 높았던 날이 있음을 확인하고, 이 날에 무슨 일이 있었는 지
뉴스를 검색해보기로 한다. 그는 지도 밑에 있는 slider에 관심을 가지고 handle을 이동시켰고, 곧 날짜를 선택할 수 있음을 알게 된다. 
slider에서 미세먼지 농도가 높았던 날의 주변 기간으로 설정한 후, 플레이 버튼을 클릭하고 애니메이션을 본다. 곧 그는 전국 지도에서 다른 지역과
비교해보기 위해 홈으로 돌아가고, 같은 기간동안의 애니메이션을 바람의 방향과 함께 보면서 그 원인에 대해 생각해본다. 애니메이션을 종료한 그는 곧 페
이지를 나간다.

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
