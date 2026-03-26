"""
MoneyPuck CSV Processor

This script expects an input CSV file that has been downloaded from https://moneypuck.com/data.htm,
specificly a regular season CSV file from the "Season Level Data" section and for the "Skaters"
player type.

Key Operations:
1. Filters for 5-on-5 situations and forwards (L, C, R) with at least 30 games played.
2. Calculates Points per 60 minutes (P/60) from raw icetime and points.
3. Ranks players across six key metrics: P/60, Goals, Assists, xG, Corsi For %, 
   and High Danger Shots.
4. Normalizes these ranks into a 0-100 percentile scale, where 100 represents 
   the top performer in that category.
5. Outputs a cleaned CSV containing both raw stats and normalized rankings.

Usage:
    python mp_forwards_5on5.py --input_filename skaters.csv --output_filename forwards_2024.csv
"""

import argparse

import polars as pl


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_filename', type=str, required=True, help='The filename of the regular season "Skaters" CSV file downloaded from moneypuck.com')
    parser.add_argument('--output_filename', type=str, help='The filename to save the output CSV file as')
    args = parser.parse_args()

    df = pl.read_csv(args.input_filename).rename(
        {'I_F_goals': 'goals',
         'I_F_primaryAssists': 'assists',
         'I_F_xGoals': 'xg',
         'onIce_corsiPercentage': 'corsi_for_pct',
         'I_F_highDangerShots': 'high_danger_shots'}
    )

    # Only use even strength situations, and only forwards who have played more than 30 games
    df = df.filter(
        pl.col('situation') == '5on5',
        pl.col('games_played') >= 30,
        pl.col('position').is_in(['L', 'C', 'R']),
    )

    # Sort by name so that alphabetical ordering is used for duplicate rankings when using the ordinal method
    df = df.sort('name')

    # Calculate points per 90 minutes (the "icetime" column is in seconds)
    df = df.with_columns(
        (
            pl.when(pl.col('icetime') > 0)
            .then((pl.col('I_F_points') / pl.col('icetime')) * 3600)
            .otherwise(0.0) # Handle division by zero
        ).alias('p/60')
    )

    # Collect rank columns
    df = df.with_columns(
        pl.col('p/60').rank(
            method='ordinal',
            descending=True
        ).alias('p/60_rank'),
        pl.col('goals').rank(
            method='ordinal',
            descending=True
        ).alias('goals_rank'),
        pl.col('assists').rank(
            method='ordinal',
            descending=True
        ).alias('assists_rank'),
        pl.col('xg').rank(
            method='ordinal',
            descending=True
        ).alias('xg_rank'),
        pl.col('corsi_for_pct').rank(
            method='ordinal',
            descending=True
        ).alias('corsi_rank'),
        pl.col('high_danger_shots').rank(
            method='ordinal',
            descending=True
        ).alias('hds_rank'),
    )

    # Normalize a rank column to a 0-100 scale, where 100 is the top rank and 0 is the lowest.
    def normalize_rank(col: str, mx: int) -> pl.Expr:
        return (100 - (pl.col(col) - 1) * 100 / (mx - 1))

    # Create normalized rank column that can be displayed in a radar chart
    df = df.with_columns(
        (normalize_rank('p/60_rank', df['p/60_rank'].max())).alias('p/60_rank_norm'),
        (normalize_rank('goals_rank', df['goals_rank'].max())).alias('goals_rank_norm'),
        (normalize_rank('assists_rank', df['assists_rank'].max())).alias('assists_rank_norm'),
        (normalize_rank('xg_rank', df['xg_rank'].max())).alias('xg_rank_norm'),
        (normalize_rank('corsi_rank', df['corsi_rank'].max())).alias('corsi_rank_norm'),
        (normalize_rank('hds_rank', df['hds_rank'].max())).alias('hds_rank_norm'),
    )

    df = df.select(
      ['playerId',
       'season',
       'name',
       'team',
       'position',
       'games_played',
       'icetime',
       'p/60', 'p/60_rank', 'p/60_rank_norm',
       'goals', 'goals_rank', 'goals_rank_norm',
       'assists', 'assists_rank', 'assists_rank_norm',
       'xg', 'xg_rank', 'xg_rank_norm',
       'corsi_for_pct', 'corsi_rank', 'corsi_rank_norm',
       'high_danger_shots', 'hds_rank', 'hds_rank_norm']
    )

    if args.output_filename:
      df.write_csv(args.output_filename)
    else:
      print(df.head())


if __name__ == '__main__':
    main()