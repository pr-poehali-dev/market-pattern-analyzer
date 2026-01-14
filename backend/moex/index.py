import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''
    API для получения данных с Московской биржи (MOEX ISS).
    Поддерживает получение котировок, исторических данных и информации о ценных бумагах.
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', 'quotes')
    
    try:
        if action == 'quotes':
            tickers = query_params.get('tickers', 'SBER,GAZP,LKOH,YNDX').split(',')
            data = get_current_quotes(tickers)
        elif action == 'history':
            ticker = query_params.get('ticker', 'YNDX')
            days = int(query_params.get('days', '30'))
            data = get_history(ticker, days)
        elif action == 'search':
            query = query_params.get('q', '')
            data = search_securities(query)
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unknown action'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(data, ensure_ascii=False)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def get_current_quotes(tickers: List[str]) -> Dict[str, Any]:
    '''Получить текущие котировки для списка тикеров'''
    result = []
    
    for ticker in tickers:
        try:
            url = f'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/{ticker}.json'
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if not data.get('marketdata', {}).get('data'):
                continue
            
            marketdata = data['marketdata']
            columns = marketdata['columns']
            row = marketdata['data'][0] if marketdata['data'] else []
            
            if not row:
                continue
            
            market_dict = {columns[i]: row[i] for i in range(len(columns))}
            
            securities = data.get('securities', {})
            sec_columns = securities.get('columns', [])
            sec_data = securities.get('data', [[]])[0]
            sec_dict = {sec_columns[i]: sec_data[i] for i in range(len(sec_columns))} if sec_data else {}
            
            last_price = market_dict.get('LAST') or market_dict.get('CURRENTVALUE')
            prev_price = market_dict.get('PREVPRICE') or last_price
            
            if last_price and prev_price:
                change_percent = ((last_price - prev_price) / prev_price * 100) if prev_price else 0
            else:
                change_percent = 0
            
            result.append({
                'ticker': ticker,
                'name': sec_dict.get('SHORTNAME', ticker),
                'price': last_price,
                'change': last_price - prev_price if last_price and prev_price else 0,
                'changePercent': round(change_percent, 2),
                'volume': market_dict.get('VOLTODAY', 0),
                'high': market_dict.get('HIGH'),
                'low': market_dict.get('LOW'),
                'open': market_dict.get('OPEN'),
            })
        except Exception as e:
            continue
    
    return {'quotes': result}


def get_history(ticker: str, days: int = 30) -> Dict[str, Any]:
    '''Получить исторические данные по тикеру'''
    try:
        till = datetime.now().strftime('%Y-%m-%d')
        from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        url = f'https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQBR/securities/{ticker}.json'
        params = {
            'from': from_date,
            'till': till,
            'start': 0
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        history = data.get('history', {})
        columns = history.get('columns', [])
        rows = history.get('data', [])
        
        candles = []
        for row in rows:
            if not row:
                continue
            row_dict = {columns[i]: row[i] for i in range(len(columns))}
            
            if row_dict.get('CLOSE'):
                candles.append({
                    'date': row_dict.get('TRADEDATE'),
                    'open': row_dict.get('OPEN'),
                    'high': row_dict.get('HIGH'),
                    'low': row_dict.get('LOW'),
                    'close': row_dict.get('CLOSE'),
                    'volume': row_dict.get('VOLUME', 0),
                })
        
        return {'ticker': ticker, 'history': candles}
    
    except Exception as e:
        return {'ticker': ticker, 'history': [], 'error': str(e)}


def search_securities(query: str) -> Dict[str, Any]:
    '''Поиск ценных бумаг по названию или тикеру'''
    try:
        url = f'https://iss.moex.com/iss/securities.json'
        params = {'q': query}
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        securities = data.get('securities', {})
        columns = securities.get('columns', [])
        rows = securities.get('data', [])
        
        results = []
        for row in rows:
            if not row:
                continue
            row_dict = {columns[i]: row[i] for i in range(len(columns))}
            
            if row_dict.get('type') in ['common_share', 'preferred_share']:
                results.append({
                    'ticker': row_dict.get('secid'),
                    'name': row_dict.get('shortname'),
                    'fullName': row_dict.get('name'),
                    'type': row_dict.get('type'),
                    'isTraded': row_dict.get('is_traded', 0) == 1
                })
        
        return {'results': results[:20]}
    
    except Exception as e:
        return {'results': [], 'error': str(e)}
