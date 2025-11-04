from recommender import Recommender


def main():
    r = Recommender(system_csv='cleaned_leetcode_dataset.csv')
    try:
        r.fit()
        print('OK: Loaded system dataframe with shape:', r.system_df.shape)
    except Exception as e:
        print('ERROR:', e)


if __name__ == '__main__':
    main()
